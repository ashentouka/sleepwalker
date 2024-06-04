{
    const rowparser = require("../core/simple/rowparser")
    const client = require('@sleepwalker/client-simple');
    const loader = require('../core/cached-scraper');

    function runner() {
        let path = `https://iplocation.net/proxy-list/index/`;

        function parser(cb) {
            let data = [];

            function next(pg) {
                client.client(path + (pg*10)).then(res => {
                    
                        const $ = res.data;
                        const source =  {selector: "div.table-responsive table.table tbody tr", maxpage: 4};
                        let rows = rowparser({$, source })
                        data = data.concat(rows);
                        if (rows.length > 0 && pg < source.maxpage) {
                            setTimeout(function (){next(pg + 1)},500);
                        } else {
                            cb(null, data);
                        }
                    
                });
            }

            next(0);
        }

        return function () {
            return loader(path, "http",{ ttl: { refresh: 30 * 60 * 1000 }, auto: 30 * 60 * 1000 }, parser);
        }

    }

    module.exports = {
        http: runner()
    }
}
