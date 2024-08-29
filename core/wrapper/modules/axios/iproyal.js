{
    const rowparser = require("../../core/parsers/simple");
    const loader = require('../../core/cached-scraper');

    let protocache;
    let promise;

    function runner(proto) {
        let path = `https://iproyal.com/free-proxy-list/?entries=100&page=`;

        function parser(cb) {
            if (proto === "http") {
                promise = new Promise(resolve => {
                rowparser.typepaged(path, { selector: "body > main > section.astro-lmapxigl > div.astro-lmapxigl > div.astro-lmapxigl > div.grid", cell: "div.flex", maxpage: 100, skiprow: true }, function(e,d){
                    if (d) {
                        protocache = d;
                        resolve();
                        cb(null, d.types.http);
                    } else {
                        cb(e);
                    }
                });
                    });
            } else {
                promise.then(function(){
                    cb(null,protocache.types[proto]);
                });
            }
        }

        return function () {
            return loader(path, proto, { auto: 2 * 60 * 1000, track: true, ttl: { refresh: 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        https: runner("https"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}
