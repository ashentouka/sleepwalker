{
    const async = require("async"),
        realip = require("./realip"),
        path = require("path"),
        fs = require("fs")

     DisArray = require("disarray");

    const konsole = require("@sleepwalker/konsole").komponent("proxyarmada","red").komponent("proxytester","magentaBright");

    const simple = require("@sleepwalker/client-simple");
    const protocols = ["http", "socks4", "socks5"];

    let bl_interval, work_interval;

    const iterate = (f,_fin) => {
        for (let prx = 0; prx < protocols.length; prx++) {
            f(protocols[prx]);
        }
        if (_fin) _fin();
    }

    function start(proxproto,syserr) {
        return new Promise(resolve => {

            konsole.logger("starting proxytester.");
            realip().then(real => {
                konsole.logger(`real ip: ${real.query}`);
                if (fs.existsSync(path.resolve(`${__dirname}/../data/working`))) fs.rmSync(path.resolve(`${__dirname}/../data/working`),{recursive:true});
                const runstat_lib = require("./runstat"),
                    asnlookup = require("../asn/asnlookup"),
                    datastore = require("./datastore");

                let bl_interval = setInterval(function (){
                    datastore.blacklist.save(blacklist);
                }, 30000)
                let work_interval = setInterval(function(){
                    datastore.working.save(working);
                },10000)

                let blacklist = (() => {
                    let bl = datastore.blacklist;
                    let socks4 = bl.socks4.loadCache();
                    let socks5 = bl.socks5.loadCache();
                    let http = bl.http.loadCache();
                    return {
                        socks5,
                        socks4,
                        http
                    }
                })();

                let working = (() => {
                    let socks4 = [], socks5 = [], http = [];
                    return {
                        socks4, socks5, http
                    }
                })();

                fs.mkdirSync(path.resolve(`${__dirname}/../data/working/location`), {recursive: true});
                let runstat = runstat_lib(proxproto.totalunique, working);
                let proxytester = async.queue((task, callback) => {
                    let withprotocol = `${task.protocol}://${task.uri}`;
                    if (blacklist[task.protocol] && blacklist[task.protocol].includes(task.uri)) {
                        runstat.bad();
                        callback();
                    } else {
                        simple.ipinfo(withprotocol).then(d=>{
                                if (d.query === real.query) {
                                    blacklist[task.protocol].push(task.uri);
                                    runstat.bad();
                                    callback();
                                } else {
                                    try {
                                        working[task.protocol].push(task.uri);
                                        let asndata = asnlookup.asndata(task.uri);
                                        let asntype = (!asndata || !asndata.asn || !asndata.asn.residential) ? "other" : "residential";
                                        if (d.countryCode) {
                                            if (["US", "GB", "CA"].includes(d.countryCode)) {
                                                fs.appendFileSync(path.resolve(`${__dirname}/../data/working/location/${d.countryCode}-${d.regionName}-${asntype}.txt`), `${withprotocol}\n`)
                                            } else {
                                                fs.appendFileSync(path.resolve(`${__dirname}/../data/working/location/${d.countryCode}-${asntype}.txt`), `${withprotocol}\n`)
                                            }
                                        }
                                        runstat.good()
                                        callback();
                                    } catch (e) {
                                        blacklist[task.protocol].push(task.uri);
                                        runstat.bad()
                                        callback();
                                    }
                            }
                    
                    }).catch(function(){
                        blacklist[task.protocol].push(task.uri);
                                runstat.bad()
                                callback();
                    });
                }
                }, 750);

                iterate(type => {
                    for (let pridx = 0; pridx < proxproto[type].length; pridx++) {
                        proxytester.push({uri: proxproto[type][pridx], protocol: type});
                    }
                }, function () {
                    proxytester.drain(function () {
                        clearInterval(bl_interval);
                        clearInterval(work_interval);
                        datastore.working.save(working);
                        datastore.blacklist.save(blacklist);
                        runstat.stop();
                        datastore.finished().then(() => {
                            resolve(working);
                        });
                    });
                });
            }).catch(e => {
                console.log("Could not get data for real ip address");
                syserr("realip")(e);
                resolve();
            });
        });
    }

    module.exports = start
}