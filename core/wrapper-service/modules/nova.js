const parser = require("../core/puppeteer/parser-puppeteer"),
loader = require("../core/cached-scraper");

module.exports = function (){
    const parser = require("../core/puppeteer/parser-puppeteer");
    const url = "https://www.proxynova.com/proxy-server-list";

    return function () {
        return loader(url, "http", { ttl: { refresh: 30 * 60 * 1000 }, auto: 30 * 60 * 1000 },function (cb){
            parser.paged(url, {selector: "#tbl_proxy_list tbody tr", namedpages: [ "/anonymous-proxies/", "/elite-proxies/" ]}, cb);
        });
    }
}
module.exports()()