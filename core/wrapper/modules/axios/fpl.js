{
    function runner(){
        const parser = require("../../core/parsers/simple"),
            loader = require("../../core/cached-scraper"),
            url = "https://free-proxy-list.net";

        return function () {
            return loader(url, "http", { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 60 * 1000 }}, function (cb) {
                parser.table(url, {selector: "div.fpl-list table tbody tr"}, cb);
            })
        }
    }
    module.exports = {
        http: runner()
    }
}