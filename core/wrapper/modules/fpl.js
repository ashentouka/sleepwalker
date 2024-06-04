{
    function runner(){
        const parser = require("../core/simple/parser-simple"),
            loader = require("../core/cached-scraper"),
            url = "https://free-proxy-list.net";

        return function () {
            return loader(url, "http", {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
                parser.table(url, {selector: "div.fpl-list table tbody tr"}, cb);
            })
        }
    }
    module.exports = {
        http: runner()
    }
}