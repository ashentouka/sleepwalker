{

    const axios = require("axios");
    const agent = require("user-agent-stealth");
    const userAgent = (opts) => {
        switch (opts.agent) {
            case "any":
            case "mobile":
            case "desktop":
                return agent[opts.agent];
                //break;
            default:
               // console.warn(`> opts.agent < is not a valid option for opts.agent, reverting to "desktop"`);
                return agent["desktop"];
        }
    };

    const ProxyAgent = require("simple-proxy-agent");
    function contentTypeRouting(res) {
        const {status,headers,data} = res;
        if (res.status >= 200 && res.status < 400) {
            let content_type = res.headers['content-type'];
            if (content_type.indexOf("; charset=") > 0) content_type = content_type.split("; charset=")[0]

            if (content_type === "text/html") {

                const html = res.data;
                const cheerio = require("cheerio");
                let $ = cheerio.load(html);

                return  { type: "html", status, data: $, headers }

            } else {
                let typed = typeof res.data;
                return  {type: (typed === "object" ? "json" : typed), status, data, headers }
            }

        } else {
            return Object.assign(new Error(`HTTP Error Status ${res.status}`), { status, data, headers });
        }

    }

    function __base(meth, url, then, opts) {
        let proxy = opts.proxy;
        let data = opts.data;

        return new Promise((resolve, reject)=>{
            function _route(item) {
                if (item instanceof Error) {
                    reject (item);
                } else {
                    resolve (item);
                }
            }
        let axiosOpts = {
            headers: {"User-Agent": userAgent(opts)()},
            timeout: opts.timeout || (meth === "head" ? 5000 : 30000),
            withCredentials: true
        }

        if (proxy) {
            let agent = new ProxyAgent(proxy);
            Object.assign(axiosOpts, {
                httpAgent: agent,
                httpsAgent: agent
            })
        }
        try {
            if (meth === "post") {
                axios.post(url, data, axiosOpts)
                    .then(res=>_route(then(res)))
                    .catch(reject)
            } else {
                axios[meth](url, axiosOpts)
                    .then(res=>_route(then(res)))
                    .catch(reject)
            }
        } catch (e) {
            reject(e);
        }
        })
    }




    module.exports = {
        client: (url, opts) => {
            return __base( "get", url, contentTypeRouting, opts || {});
        },

        post: (url, opts) => {
            return __base( "post", url, contentTypeRouting, opts || {});
        },

        ipinfo: (proxy) => {
            //return new Promise((resolve, reject)=>{
            //let routing = //(cb)=>{
              // return 
                function routing(res) {
                    let content_type = res.headers['content-type'];
                    if (/^application\/json/.test(content_type)) {
                        return (res.data);
                    } else {
                        return (new Error(`returned ${content_type}`))
                    }
                }
            //}
            return __base("get",`http://ip-api.com/json?fields=17035018`, routing, {proxy});
        //})
        }
    }

}