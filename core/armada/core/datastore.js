{
    const {ArrayDataSync, JsonDataSync} = require("../datasource");
    const DisArray = require("disarray");
    const path = require("path");
    const fs = require("fs");

    class ArmadaData {
        constructor(name) {
            this.socks4 = new ArrayDataSync((path.resolve(`${__dirname}/../data/${name}/socks4`)), []);
            this.socks5 = new ArrayDataSync((path.resolve(`${__dirname}/../data/${name}/socks5`)), []);
            this.http = new ArrayDataSync((path.resolve(`${__dirname}/../data/${name}/http`)), []);
        }
        save(data) {
            this.http.updateCache(data.http);
            this.socks4.updateCache(data.socks4);
            this.socks5.updateCache(data.socks5);
        }
        list(){
           // return new Promise(resolve=>{
                
                    let http= this.http.loadCache(),
                    socks4= this.socks4.loadCache(),
                    socks5= this.socks5.loadCache()
                
                let proxylist = new DisArray();
                function collect(proto, list) {
                    let withproto = [];
                    for (let idx in list) {
                        withproto.push(`${proto}://${list[idx]}`);
                    }
                    return withproto;
                }
                return proxylist.concat(collect('http', http),
                collect('socks4', socks4),
                collect('socks5', socks5));
          // return proxylist;
         //   })
        }
    }

//    let blacklist = new ArmadaData("blacklist");
    let untested, armada, working;

    function bounce() {
        untested = new ArmadaData("untested");
        armada = new ArmadaData("export");
        working = new ArmadaData("working");
    }

    bounce();
    const finished = function () {
        return new Promise(resolve => {
        fs.rmSync((path.resolve(`${__dirname}/../data/export`)), {recursive:true});
        fs.renameSync((path.resolve(`${__dirname}/../data/working`)), (path.resolve(`${__dirname}/../data/export`)));
        fs.rmSync((path.resolve(`${__dirname}/../data/untested`)), {recursive:true});
        setTimeout(() => {
            bounce();
            resolve();
        }, 500)
        })
    }

    module.exports = {
//        blacklist,
        untested,
        armada,
        working,
        finished
    }
}