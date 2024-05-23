const client = require("@sleepwalker/client-simple");
const loader = require('../core/cached-scraper');


const path = `https://vpn.fail/free-proxy/json`;


const jsonPromise = new Promise(resolve=>{
    (function load(){
        let proxy = {};
        let types = [];
        
        client.client(path).then(response=>{
            for (let idx in response.data) {
                let entry = response.data[idx];
                if (!proxy[entry.type]) {
                    proxy[entry.type]=[entry.proxy];
                    types.push(entry.type);
                } else {
                    proxy[entry.type].push(entry.proxy);
                }
            }
            resolve(proxy);
        })
    })();
})

const API = {};
(function stubAPI(){
    const ptype = ["http", "socks4", "socks5"];
    for (let type in ptype) {
        const name = ptype[type];
        API[name]=()=>{
            //return function () {
                return loader(path, name, {ttl: {refresh: 30 * 60 * 1000}, auto: 30 * 60 * 1000}, function(cb){
                    jsonPromise.then(function(proxy) {
                        cb(null, proxy[name]);
                    });
                });
            //}
        }
    }

    module.exports = API;
})();