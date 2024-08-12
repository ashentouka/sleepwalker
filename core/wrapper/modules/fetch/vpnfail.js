{
    const loader = require('../../core/cached-scraper');
    const { simple } = require('@sleepwalker/horde');

    let lasttime = new Date().getTime();
    let lastchange = ""
    let protocache = {};
    let promise;

    function runner(proto) {
        let pageout = `https://vpn.fail/free-proxy/json`;

        function parser(cb) {
            if (proto === "http") {
                promise = new Promise(resolve => {
            
                    simple({ url: pageout, accept: "json" }).then(response=>{
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
            return loader(pageout, proto, { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}