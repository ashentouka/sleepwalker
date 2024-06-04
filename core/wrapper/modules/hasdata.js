{
    const rowparser = require("../core/simple/parser-simple");
    const loader = require('../core/cached-scraper');

    let protocache;
    let promise;

    function runner(proto) {
        let path = `https://hasdata.com/free-proxy-list`;

        function parser(cb) {
            if (proto === "http") {
                promise = new Promise(resolve => {
                    rowparser.typetable(path, { selector: "table.richtable tbody tr", 
                        cell: "td", maxpage: 100, skiprow: true }, function(e,d){

                        if (d) {
                            protocache = d;
                            resolve();
                            cb(null, d.types.http);
                        } else {
                            resolve();
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
            return loader(path, proto, { cron: '0 * * * *', ttl: { refresh: 10 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        https: runner("https"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    };
}