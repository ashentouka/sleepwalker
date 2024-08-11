{
    const loader = require('../../core/cached-scraper');
    const { simple } = require('@sleepwalker/horde');

    const pageout = "https://mtpro.xyz/api/?type=socks"

    function runner() {
        function parser(cb) {
            let proxy = [];
            simple({ url: pageout, accept: "json" }).then(response=>{
                for (let idx in response.data) {
                    let entry = response.data[idx];
                    proxy.push(`${entry.ip}:${entry.port}`);
                }
                cb(null, proxy);    
            })
        }
        return function () {
            return loader(pageout, "socks5", { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 5.5 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        socks5: runner()
    }
}