{
    const client = require("@sleepwalker/client-simple");
    const loader = require('../core/cached-scraper');

    let protocache = {};
    let promise;

    function runner(proto) {
        let path = `https://vpn.fail/free-proxy/json`;

        function parser(cb) {
            if (proto === "http") {
                promise = new Promise(resolve => {
            
                    client.client(path).then(response=>{
                        for (let idx in response.data) {
                            let entry = response.data[idx];
                            if (!protocache[entry.type]) {
                                protocache[entry.type]=[entry.proxy];
                            } else {
                                protocache[entry.type].push(entry.proxy);
                            }
                        }
                        resolve();
                        cb(null,protocache["http"]);
                    });
                });
            } else {
                promise.then(function(){
                    cb(null,protocache[proto]);
                });
            }
        }

        return function () {
            return loader(path, proto, { auto: 2 * 60 * 1000, ttl: { refresh: 1 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}