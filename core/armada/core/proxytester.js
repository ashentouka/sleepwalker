{
    const async = require("async"),
        realip = require("./realip"),
        path = require("path"),
        fs = require("fs");

    const DisArray = require("@sleepwalker/disarray");

    const konsole = require("@sleepwalker/konsole").komponent("proxyarmada","red").komponent("proxytester","magenta");

    const datastore = require(path.resolve(__dirname + "/../../data/datasourcery"));
    const { ipinfo, scamalytics } = require("@sleepwalker/horde");
    const protocols = ["http", "https", "socks4", "socks5"];

    let work_interval;

    const iterate = (f,_fin) => {
        for (let prx = 0; prx < protocols.length; prx++) {
            f(protocols[prx]);
        }
        if (_fin) _fin();
    }

    function start(proxproto,syserr) {
        process.on('unhandledRejection', (reason, p) => {
        }).on('uncaughtException', err => {
        });

        return new Promise(resolve => {

            konsole.logger("starting proxytester.");
            realip({}).then(real => {
                konsole.logger("real ip:", real.data.query);

                const runstat_lib = require("./runstat"),
                    asnlookup = require("../asn/asnlookup");

                let working = (() => {
                    let socks4 = [], socks5 = [], http = [], https = [];
                    return {
                        socks4, socks5, http, https
                    }
                })();

                let runstat = runstat_lib(proxproto.totalunique, working);
                let proxytester = async.queue((task, callback) => {
                    let proxy = `${task.protocol}://${task.uri}`;

                    let cancelled = false;
                    let callbacked = false;

                    let cancellor = setTimeout(function() {
                        cancelled = true;
                        runstat.bad()
                        if (!callbacked) {
                            callbacked = true;
                            callback();
                        }
                    }, 90000);

                    function result(type){
                        if (!cancelled) {
                            clearTimeout(cancellor);
                            runstat[type]()
                            if (!callbacked) {
                                callbacked = true;
                                callback();
                            }
                        }
                    }

                    ipinfo({ proxy, timeout: 5000 }).then(response=>{
                        if (response.data.query === real.data.query) {
                            result("bad");
                        } else {
                            try {
                                let asndata = asnlookup.asndata(task.uri);
                                let residential = asndata?.asn?.residential;

                                datastore.saveProxy({ protocol: task.protocol, proxy: task.uri, country: response.data.countryCode, state: response.data.regionName, residential: residential ? 1 : 0 })
                                scamalytics({ ip: task.uri.replace(/:\d{2,5}/, ""), timeout: 18000 }).then(score=>{
                                    datastore.saveScore({ proxy: task.uri, score })
                                    working[task.protocol].push(task.uri);
                                    result("good");

                                }).catch(function(ex){
                                    result("bad");
                                    
                                })
                            } catch (e) {
                                result("bad");
                            }
                        }
                    }).catch(function(ex){
                        result("bad");
                    });
                }, 1000);

                iterate(type => {
                    for (let pridx = 0; pridx < proxproto[type].length; pridx++) {
                        proxytester.push({uri: proxproto[type][pridx], protocol: type});
                    }
                }, function () {
                    proxytester.drain(async function () {
                        runstat.stop();
                        datastore.promote();
                        await datastore.export();
                        resolve();
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