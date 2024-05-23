{
    const rowparser = require("../core/simple/rowparser")
    const client = require('@sleepwalker/client-simple');
    const loader = require('../core/cached-scraper');

    function runner() {
        let path = `https://iplocation.net/proxy-list`;

        function parser(cb) {
            let data = [];

            function next(url) {
                client.client(url, null, (e, d) => {
                    if (!e) {
                        const $ = d.data;

                        let rows = rowparser($, {selector: "div.table-responsive table.table tbody tr"})
                        let n = $("a[rel='next']");
                        data = data.concat(rows);
                        if (rows.length > 0 && n.length > 0) {
                            setTimeout(function (){
                                next(`https:${n.attr("href")}`)
                            },300);
                        } else {
                            cb(null, data);
                        }


                    } else {
                        cb(e);
                    }
                });
            }

            next(path);
        }

        return function () {
            return loader(path, "http",{ ttl: { refresh: 30 * 60 * 1000 }, auto: 30 * 60 * 1000 }, parser);
        }

    }

    if (require.main === module) {
        runner()()
    } else {
        module.exports = runner()
    }
}
