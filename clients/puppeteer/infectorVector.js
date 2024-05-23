{
    function infectorVector(opts) {
        const puppeteer = require('puppeteer-extra')
        const {executablePath} = require('puppeteer');
        const agent = require("user-agent-stealth");
        const userAgent = (() => {
            switch (opts.agent) {
                case "any":
                case "mobile":
                    return agent[opts.agent];
                    //break;
                default:
                    //console.warn(`> opts.agent < is not a valid option for opts.agent, reverting to "desktop"`);
                    return agent["desktop"];
            }
        })();

        let _already_ = [];
        const _use_ = function (plugin) {
            if (!_already_.includes(plugin)) {
                puppeteer.use(plugin)
                _already_.push(plugin);
            }
        }

        const plugins = {
            adblocker(blockTrackers) {
                const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
                puppeteer.use(AdblockerPlugin({blockTrackers}))
            },
            block(what){
                puppeteer.use(require('puppeteer-extra-plugin-block-resources')({
                blockedTypes: new Set(what || ['image', 'stylesheet', 'font', 'media', 'other'])}));
            },
            clickandwait(){
                puppeteer.use(require("puppeteer-extra-plugin-click-and-wait")());
            },
            stealth() {
                puppeteer.use(require('puppeteer-extra-plugin-stealth')());
            },
            recaptcha() {
                puppeteer.use(require('puppeteer-extra-plugin-recaptcha')());
            },

            //  bakery(data){ const bakery = require("puppeteer-extra-plugin-bakery")(data); puppeteer.use(bakery); return bakery;},
            //  geeTest() { const geetest = require("puppeteer-extra-plugin-geetest"); puppeteer.use(geetest); return geetest; },
            use: _use_()
        }
        const promise = (function client() {
                return puppeteer.launch({
                    headless: "new",
                    executablePath: executablePath(),

               /*     args: [
                        "--no-sandbox",
                        `--user-agent=${userAgent}`]*/
                })
        })();

        function client(url) {
            return new Promise((resolve, reject) => {
                let page;

                try {
                    promise.then(browser => {
                        browser.newPage().then(np=>{
                            (async () => {
                                page = np;

                                let headers= { 
                                    'user-agent': userAgent(), 
                                    'upgrade-insecure-requests': '1', 
                                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
                                    'accept-encoding': 'gzip, deflate, br', 
                                    'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
                                };
                                if (opts && opts.headers) {
                                    Object.assign(headers, opts.headers);
                                }

                                await page.setExtraHTTPHeaders(headers);

                                setTimeout(function() {
                                    (async () => {
                                        if (opts && opts.proxy) {
                                            const pageProxy = require("puppeteer-page-proxy");
                                            pageProxy(page, opts.proxy);
                                        }
                                        if (opts && opts.cookies) {
                                            await page.setCookie(...opts.cookies);
                                        }
                                        page.goto(url).then(() => {
                                            resolve(page);
                                        }).catch(e => {
                                            reject(e);
                                        });
                                    })()
                                    
                                }, (Math.floor(Math.random() * 5) + 3) * 1000)
                            })()
                        }).catch(reject);
                    }).catch(reject);

                } catch (ex) {
                    if (page && !page.isClosed()) page.close()
                    reject(ex);
                }
            })

        }

        const ipinfo = require("./_ipinfo")(client);
        return {
            plugins,
            client,
            ipinfo,
            browser() {
                return promise
            }
        }
    }

    module.exports = infectorVector
}