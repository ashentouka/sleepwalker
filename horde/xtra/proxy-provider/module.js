{
	const got = require("got");
	const { CookieJar } = require("tough-cookie");
	const HttpProxyAgent = require("http-proxy-agent");
	const HttpsProxyAgent = require("https-proxy-agent");
	const { SocksProxyAgent } = require("socks-proxy-agent");
	
	// Responsible for applying proxy
	const requestHandler = async (request, proxy, overrides = {}) => {
	    // Reject non http(s) URI schemes
	    if (!request.url().startsWith("http") && !request.url().startsWith("https")) {
	        request.continue(); return;
	    }
		
		if (!request.isInterceptResolutionHandled()){

		    try {
			    const cookieHandler = new CookieHandler(request);
			    
			    // Request options for GOT accounting for overrides
			    const options = {
			        cookieJar: await cookieHandler.getCookies(),
			        method: overrides.method || request.method(),
			        body: overrides.postData || request.postData(),
			        headers: overrides.headers || setHeaders(request),
			        agent: setAgent(proxy),
			        responseType: "buffer",
			        maxRedirects: 15,
			        throwHttpErrors: false,
			        ignoreInvalidCookies: true,
			        followRedirect: true,
			        https: { rejectUnauthorized: false }
			    };

		        const response = await got(overrides.url || request.url(), options);
		        
		        // Set cookies manually because "set-cookie" doesn't set all cookies (?)
		        // Perhaps related to https://github.com/puppeteer/puppeteer/issues/5364
		        const setCookieHeader = response.headers["set-cookie"];
		        if (setCookieHeader) {
		            await cookieHandler.setCookies(setCookieHeader);
		            response.headers["set-cookie"] = undefined;
		        }
		        await request.respond({
		            status: response.statusCode,
		            headers: response.headers,
		            body: response.body
		        });
		    } catch (error) {
		        await request.abort();
		    }
		}
	};

	// For reassigning proxy of page
	const removeRequestListener = (page, listenerName) => {
	    const eventName = "request";
	    const listeners = page.eventsMap?.get(eventName);
	    if (listeners) {
	        const i = listeners.findIndex((listener) => {
	            return listener.name === listenerName
	        });
	        listeners.splice(i, 1);
	        if (!listeners.length) {
	            page.eventsMap.delete(eventName);
	        }
	    }
	};

	// Set some extra headers because Puppeteer doesn't capture all request headers
	// Related: https://github.com/puppeteer/puppeteer/issues/5364
	const setHeaders = (request) => {
	    const headers = {
	        ...request.headers(),
	        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	        "Accept-Encoding": "gzip, deflate, br, zstd",
	        "Accept-Language": "en-US,en;q=0.9", 
	        "Upgrade-Insecure-Requests": "1",
	        "Host": new URL(request.url()).host
	    }
	    if (request.isNavigationRequest()) {
	        headers["sec-fetch-mode"] = "navigate";
	        headers["sec-fetch-site"] = "none";
	        headers["sec-fetch-user"] = "?1";
	    } else {
	        headers["sec-fetch-mode"] = "no-cors";
	        headers["sec-fetch-site"] = "same-origin";
	    }
	    return headers;
	};

	// For applying proxy
	const setAgent = (proxy) => {
	    if (proxy.startsWith("socks")) {
	        return {
	            http: new SocksProxyAgent(proxy),
	            https: new SocksProxyAgent(proxy)
	        };
	    } else {
	        return {
	            http: new HttpProxyAgent(proxy),
	            https: new HttpsProxyAgent(proxy)
	        };
	    }
	};

	class CDP {
	    constructor(client) {
	        // Network domain: https://chromedevtools.github.io/devtools-protocol/1-3/Network/
	        this.Network = {
	            async getCookies(urls) {
	                return (await client.send("Network.getCookies", urls)).cookies;
	            },
	            async setCookies(cookies) {
	                await client.send("Network.setCookies", cookies);
	            },
	            async deleteCookies(cookies) {
	                await client.send("Network.deleteCookies", cookies);
	            }
	        }
	    }
	}

	// Parse single raw cookie string to a cookie object for the browser
	const parseCookie = (rawCookie, domain) => {
	    const cookie = {name: "", value: "", domain, path: "/", secure: false, httpOnly: false, sameSite: "Lax", expires: undefined};
	    const pairs = rawCookie.split(/; */);
	    for (let i = 0; i < pairs.length; i++) {
	        // Split to key value pair e.g. key=value
	        const pair = pairs[i].split(/=(.*)/, 2);
	        // Trim and assign key and value
	        let key = pair[0].trim();
	        let value = pair[1] ? pair[1].trim() : "";
	        // Remove surrounding quotes from value if exists
	        value = value.replace(/^"(.*)"$/, "$1");
	        switch (key.toLowerCase()) {
	            case "domain": cookie.domain = value; break;
	            case "path": cookie.path = value; break;
	            case "secure": cookie.secure = true; break;
	            case "httponly": cookie.httpOnly = true; break;
	            case "samesite":
	                const firstChar = value[0].toUpperCase();
	                const restChars = value.slice(1).toLowerCase();
	                cookie.sameSite = firstChar + restChars;
	                break;
	            case "max-age":
	                // Current time and 'max-age' in seconds
	                const currentTime = new Date().getTime() / 1000;
	                const maxAge = parseInt(value);
	                cookie.expires = Math.round(currentTime + maxAge);
	                break;
	            case "expires":
	                // If cookie expires hasn't already been set by 'max-age'
	                if (!cookie.expires) {
	                    const time = new Date(value).getTime();
	                    cookie.expires = Math.round(time / 1000);
	                }
	                break;
	            default: if (i < 1) {cookie.name = key; cookie.value = value}
	        }
	    }
	    return cookie;
	}

	// Format single browser cookie object to tough-cookie object
	const formatCookie = (cookie) => {
	    const currentDate = new Date().toISOString();
	    return {
	        key: cookie.name,
	        value: cookie.value,
	        expires: (cookie.expires === -1) ? "Infinity" : new Date(cookie.expires * 1000).toISOString(),
	        domain: cookie.domain.replace(/^\./, ""),
	        path: cookie.path,
	        secure: cookie.secure,
	        httpOnly: cookie.httpOnly,
	        sameSite: cookie.sameSite,
	        hostOnly: !cookie.domain.startsWith("."),
	        creation: currentDate,
	        lastAccessed: currentDate
	    };
	};

	// Responsible for getting and setting browser cookies
	class CookieHandler extends CDP {
	    constructor(request) {
	        super(request._client || request.client);
	        this.url =
	            (request.isNavigationRequest() || request.frame() == null)
	            ? request.url()
	            : request.frame().url();
	        this.domain = (this.url) ? new URL(this.url).hostname : "";
	    }
	    // Parse an array of raw cookies to an array of cookie objects
	    parseCookies(rawCookies) {
	        return rawCookies.map((rawCookie) => {
	            return parseCookie(rawCookie, this.domain);
	        });
	    };
	    // Format browser cookies to tough-cookies
	    formatCookies(cookies) {
	        return cookies.map((cookie) => {
	            return formatCookie(cookie);
	        });
	    };
	    // Get browser cookies of current page/url
	    async getCookies() {
	        const browserCookies = await this.Network.getCookies({urls: [this.url]});
	        const toughCookies = this.formatCookies(browserCookies);
	        // Add cookies to cookieJar
	        const cookieJar = CookieJar.deserializeSync({
	                version: 'tough-cookie@4.1.2',
	                storeType: 'MemoryCookieStore',
	                rejectPublicSuffixes: true,
	                cookies: toughCookies
	        });
	        return cookieJar;
	    }
	    // Set cookies to browser from "set-cookie" header
	    async setCookies(rawCookies) {
	        const browserCookies = this.parseCookies(rawCookies);
	        // Delete old cookies before setting new ones
	        for (let i = 0; i < browserCookies.length; i++) {
	            const cookie = browserCookies[i];
	            const badCookie = {
	                name: cookie.name,
	                url: this.url,
	                domain: cookie.domain,
	                path: cookie.path
	            };
	            await this.Network.deleteCookies(badCookie);
	        }
	        // Store cookies in the browser
	        await this.Network.setCookies({cookies: browserCookies});
	    }
	}

	module.exports = async (page, proxy) => {
        await page.setRequestInterception(true);
        const listener = "$ppp_requestListener";

        removeRequestListener(page, listener);
        const f = {[listener]: async (request) => {
            await requestHandler(request, proxy);
        }};

        if (proxy) {
        	page.on("request", f[listener])
        } else {
        	await page.setRequestInterception(false)
        }
    }
}