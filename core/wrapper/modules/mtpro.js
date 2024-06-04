{
    const client = require("@sleepwalker/client-simple");
    const loader = require('../core/cached-scraper');

    const path = "https://mtpro.xyz/api/?type=socks"

    function runner() {
        function parser(cb) {
            let proxy = [];
            client.client(path).then(response=>{
                for (let idx in response.data) {
                    let entry = response.data[idx];
                    proxy.push(`${entry.ip}:${entry.port}`);
                }
                cb(null, proxy);    
            })
        }
        return function () {
            return loader(path, "socks5", { auto: 2 * 60 * 1000, ttl: { refresh: 1 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        socks5: runner()
    }
}