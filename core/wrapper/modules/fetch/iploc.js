{
    const { rowparser } = require("../../parsers/simple");
    const loader = require('../../core/cached-scraper');
    const { simple } = require('@sleepwalker/horde');

    function runner() {
        let path = `https://iplocation.net/proxy-list/index/`;

        function parser(cb) {
            let data = [];

            function next(pg) {
                const pageout = path + (pg*10);
                simple({ url: pageout, accept: "html" }).then(res => {
                    
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
            return loader(path, "http",{ auto: 2 * 60 * 1000, track: true, ttl: { refresh: 60 * 1000 }}, parser);
        }

    }

    module.exports = {
        http: runner()
    }
}
