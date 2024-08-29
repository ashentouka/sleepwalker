{
    require("../util/sys");

    const useragent = require("user-agent-stealth");
    const ProxyAgent = require("simple-proxy-agent");
    const axios = require("axios");

    const async = require("async");

    let poolsize = 10;

    function sessionWrapper() {
        const { wrapper } = require('axios-cookiejar-support');
        const { CookieJar } = require('tough-cookie');

        const jar = new CookieJar();
        return wrapper(axios.create({ jar }));
    }

    function simpleClient(session) {
        const client = (session === true) ? sessionWrapper() : axios;
        

        return function http({ url, accept, data, datatype, method, proxy, timeout, mobile, filename }){
            return new Promise((resolve,reject)=>{
                let content;
                let error;
                let options = {
                    method: method || (data ? "post":"get"),
                    headers: {
                        "User-Agent": useragent[(mobile === true) ? "mobile" : "desktop"](),
                        "Accept-Encoding": "gzip, deflate, br, zstd",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Upgrade-Insecure-Requests": 0
                    },
                    responseType: (()=>{
                        switch(accept){
                            case "json": 
                                content = async response => {
                                    let data;
                                    if (response.status === 200) {
                                        data = response.data;
                                    }
                                    resolve({
                                        status: response.status,
                                        headers: response.headers,
                                        data
                                    });
                                }
                                return "json";

                            case "text": 
                                content = async response => {
                                
                                    resolve({
                                        status: response.status,
                                        headers: response.headers,
                                        data: response.data
                                    });
                                    
                                }
                                return "text";

                            case "file":
                                if (!filename) {
                                    error = new Error("filename not specified.");
                                } else {
                                    content = async response => {
                                        const { finished } = require("stream/promises");
                                        const fs = require("fs");
                                       
                                        const writer = fs.createWriteStream(filename);
                                        await finished(response.data.pipe(writer));
                                        resolve({
                                            status: response.status
                                        })
                                    }
                                    return "stream";
                                }

                            default:
                                mimetype = "text/html";
                                const cheerio = require("cheerio");
                                content = async response => {
                                    
                                    resolve({
                                        status: response.status,
                                        data: cheerio.load(response.data),
                                        headers: response.headers
                                    })
                                
                                }
                                return "html";
                            }
                        })()
                }

                if (proxy) {
                    timeout = timeout || 30000;
                    const agent = new ProxyAgent(proxy, { tunnel: true, timeout });

                    options.httpAgent = agent;
                    options.httpsAgent = agent;
                }
                if (timeout) {
                    options.timeout = timeout;
                }

                if (data){
                    const formdata = require("../util/formdata");

                    if (method.toLowerCase() === "post") {
                        if (datatype==="json"){
                            options.headers["Content-Type"]="application/json";
                            options.data=data;
                        } else {
                            options.headers["Content-Type"]="application/x-www-form-urlencoded";
                            options.data=formdata.encode(data);
                        }
                    } else {
                        url = `${url}?${formdata.encode(data)}`
                    }
                }

                options.url = url;

                if (!error) {
                    client(options).then(content).catch(reject);
                } else {
                    reject(error);
                }
            })
        }
    }

    const OPTS_IPINFO = ({ proxy, timeout }) => {
        return { url: "http://ip-api.com/json?fields=17035018", method: "get", accept: "json", proxy, timeout };
    };
    
    const OPTS_SCAMALYTICS = ({ ip, proxy, timeout }) => {
        return { url: `https://scamalytics.com/ip/${ip}`, method: "get", accept: "html", proxy, timeout };
    };

    module.exports = {
        cluster({ threads, session, mobile }) {
            let queue = async.queue((task, callback) => {
                task(callback)
            }, threads || poolsize);
            
            let maintask;

            return { 
                async task(f) {
                    maintask = f;
                    return
                },
                async queue(data, f) {
                    let mytask = f || maintask;
                    if (!mytask) throw new Error("no task defined, task should be specified by calling task(f) or as 2nd parameter to this method.");
                    queue.push(callback=>{
                        if (typeof mobile !== "undefined") data.mobile = mobile;
                        const simple = simpleClient(session);
                        simple(data).then(function(response){
                              mytask({data,response,simple,callback})
                        });
                    })
                    return
                },
                async execute(data, f) {
                    return new Promise(resolve=>{
                        let mytask = f || maintask || resolve;
                        queue.push(callback=>{
                            if (typeof mobile !== "undefined") data.mobile = mobile;
                            const simple = simpleClient(session);
                            simple(data).then(response=>mytask({data,response,simple,callback})).finally(resolve);
                        })
                    })
                },
                async idle() {
                    return new Promise(resolve=>{
                        queue.drain(function(){
                            resolve();
                        })
                    });
                },
                async close() {
                    queue.kill();
                    return
                }
            }
        },
        
        client: simpleClient(),
        session: simpleClient(true),
        
        ipinfo({proxy,timeout}) { return simpleClient()(OPTS_IPINFO({ proxy, timeout })) },

        scamalytics({ip, proxy,timeout}) {
            return new Promise((resolve,reject)=>{
                simpleClient()(OPTS_SCAMALYTICS({ ip, proxy, timeout })).then(response => {
                    if (response.status === 200) {
                        const selector = "body > div > div.container > div.guage_body > div.score_bar > div.score";
                        const $ = response.data;
                        resolve(parseInt($(selector).text().replace("Fraud Score: ", "")));
                    } else {
                        reject(new Error("scamalytics response:", response.status));
                    }
                }).catch(reject);
            });
        }
    }
}