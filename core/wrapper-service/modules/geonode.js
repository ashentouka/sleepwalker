const client = require("@sleepwalker/client-simple");
const loader = require('../core/cached-scraper');


// const path = `https://geonode.com`;

const paths = {
    http: "https://proxylist.geonode.com/api/proxy-list?anonymityLevel=elite&protocols=http%2Chttps&limit=500&sort_by=lastChecked&sort_type=desc&page=",
    socks4: "https://proxylist.geonode.com/api/proxy-list?protocols=socks4&limit=500&sort_by=lastChecked&sort_type=desc&page=",
    socks5: "https://proxylist.geonode.com/api/proxy-list?protocols=socks5&limit=500&sort_by=lastChecked&sort_type=desc&page="
}

function runner(proto) {
    let path = paths[proto];
    
    function parser(cb) {
        let proxy = [];
        function _page(page){

            client.client(path + page).then(response=>{
                for (let idx in response.data.data) {
                    let entry = response.data.data[idx];
                    proxy.push(`${entry.ip}:${entry.port}`);
                }
                if (response.data.data.length === 500) {
                    _page(page+1);
                } else {
                    cb(null, proxy);
                }
            })
        }
        _page(1);
    }

    return function () {
        return loader(path, proto, { auto: 2 * 60 * 1000, ttl: { refresh: 1 * 60 * 1000 }}, parser);
    }
}

module.exports = {
    http: runner("http"),
    socks4: runner("socks4"),
    socks5: runner("socks5")
}

/*
function geonode(url) {

    return new Promise(resolve=>{
        
        client.client(url).then($=>{
            let proxy = [];
            for (let idx in response.data) {
                let entry = response.data[idx];
                proxy.push(`${entry.ip}:${entry.port}`);
            }
            resolve(proxy);
        })
    });
}

const API = {};
(function stubAPI(){
    for (let type in paths) {
        const url = paths[type];
        API[type]=()=>{
            //return function () {
                return loader(path, type, {ttl: {refresh: 30 * 60 * 1000}, auto: 30 * 60 * 1000}, function(cb){
                    geonode().then(function(proxy) {
                        cb(null, proxy);
                    });
                });
            //}
        }
    }

    module.exports = API;
})();
*/