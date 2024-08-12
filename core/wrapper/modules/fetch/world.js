{
    const rowparser = require("../../parsers/simple");
    const loader = require('../../core/cached-scraper');

    function runner(proto) {
        let path = `https://www.freeproxy.world/?type=${proto}&anonymity=4&speed=3000&page=`;

        function parser(cb) {
            rowparser.paged(path, { selector: "table.layui-table tr", maxpage: 100 }, cb);
        }

        return function () {
            return loader(path, proto, { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}
