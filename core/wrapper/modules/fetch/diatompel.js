{
    const loader = require('../../core/cached-scraper');
    const { simple } = require('@sleepwalker/horde');

    let pages = {
        socks5: [ "https://api.ditatompel.com/proxy?type=socks5&page=1&limit=100" ],
        https: [ "https://api.ditatompel.com/proxy?type=https&anonymity=elite&page=1&limit=100",
            "https://api.ditatompel.com/proxy?type=https&anonymity=anon&page=1&limit=100" ],
        http: [ "https://api.ditatompel.com/proxy?type=http&anonymity=elite&page=1&limit=100",
            "https://api.ditatompel.com/proxy?type=http&anonymity=anon&page=1&limit=100" ]
    }

    function runner(proto) {
        const namedpages = pages[proto];

        function parser(cb) {
            let proxy_data = [];

            function pager(pg) {
                const pageout = namedpages[pg];
                simple({ url: pageout, accept: "json" }).then(response=>{
                    for (let idx in response.data.data.items) {
                        let entry = response.data.data.items[idx];
                        proxy_data.push(`${entry.ip}:${entry.port}`);
                    }
                    if (pg+1 < namedpages.length) {
                        setTimeout(function () {
                            pager(pg + 1)
                        }, 500);
                    } else {
                        cb(null, proxy_data);
                    }
                
                }).catch(cb);
            }

            pager(0);
        }
        return function () {
            return loader("https://ditatompel.com/", proto, { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        https: runner("https"),
        socks5: runner("socks5")
    }
}
