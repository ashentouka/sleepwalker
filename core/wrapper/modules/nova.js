{
    function runner(){
        const parser = require("../core/hybrid/parser-hybrid"),
            loader = require("../core/cached-scraper"),
            url = "https://www.proxynova.com/proxy-server-list";

        const namedpages = [
            "/anonymous-proxies/", 
            "/elite-proxies/",
            "/country-us/",
            "/country-ca/",
            "/country-br/",
            "/country-ve/",
            "/country-ar/",
            "/country-uk/",
            "/country-fr/",
            "/country-ru/",
            "/country-ua/",
            "/country-de/",
            "/country-pl/",
            "/country-jp/",
            "/country-sg/",
            "/country-kr/",
            "/country-th/",
            "/country-id/",
            "/country-tw/",
            "/country-hk/",
            "/country-co/",
            "/country-in/",
            "/country-iq/",
            "/country-ir/",
            "/country-mx/",
            "/country-pe/",
            "/country-za/"
        ]

        return function () {
            return loader(url, "http", { ttl: { refresh: 30 * 60 * 1000 }, auto: 30 * 60 * 1000 },function (cb){
                parser.paged(url, {selector: "#tbl_proxy_list tbody tr", namedpages }, cb);
            });
        }
    }
    module.exports = {
        http: runner()
    }
}