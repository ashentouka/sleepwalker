{
    const rowparser = require("../core/simple/parser-simple");
    const client = require('@sleepwalker/client-simple');
    const loader = require('../core/cached-scraper');

    let protocache;

    function runner(proto) {
        let path = `https://iproyal.com/free-proxy-list/?entries=100&page=`;

        function parser(cb) {
            if (proto === "http") {
                rowparser.typepaged(path, { selector: "body > main > section.astro-lmapxigl > div.astro-lmapxigl > div.astro-lmapxigl > div.grid", cell: "div.flex", maxpage: 100, skiprow: true }, function(e,d){
                    if (d) {
                        protocache = d;
                        cb(null, d.types.http);
                    } else {
                        cb(e);
                    }
                });
            } else {
                cb(null,protocache.types[proto]);
            }
        }

        return function () {
            return loader(path, proto, { auto: 2 * 60 * 1000, ttl: { refresh: 1 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        https: runner("https"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}
