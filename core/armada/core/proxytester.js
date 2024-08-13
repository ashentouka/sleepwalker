{
    const async = require("async"),
        realip = require("./realip"),
        path = require("path"),
        fs = require("fs");

    const DisArray = require("@sleepwalker/disarray");

    const konsole = require("@sleepwalker/konsole").komponent("proxyarmada","red").komponent("proxytester","magenta");

    const datastore = require(path.resolve(__dirname + "/../../data/datasourcery"));
    const konf = require(path.resolve(__dirname + "/../../data/konf"))("proxytester");
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
                    }, konf.cancelafter);

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

                    let x2 = false;

                    (function thetest(){

                        function doOver(){
                            if (!konf.httpsretest) return false;
                            if (/https?/.test(task.protocol) && !x2){
                                task.protocol = (task.protocol === "http") ? "https" : "http";
                                proxy = `${task.protocol}://${task.uri}`;
                                x2 = true;
                                thetest();

                                return true;
                            } else {
                                return false;
                            }
                        }

                        ipinfo({ proxy, timeout: konf.timeout }).then(response=>{
                            if (response.data.query === real.data.query) {
                                result("bad");
                            } else {
                                try {
                                    let asndata = asnlookup.asndata(task.uri);
                                    let residential = asndata?.asn?.residential;

                                    datastore.saveProxy({ protocol: task.protocol, proxy: task.uri, country: response.data.countryCode,
                                     state: response.data.regionName, residential: residential ? 1 : 0 })
                                    scamalytics({ ip: task.uri.replace(/:\d{2,5}/, ""), timeout: konf.scamalytics }).then(score=>{
                                        datastore.saveScore({ proxy: task.uri, score })
                                        working[task.protocol].push(task.uri);
                                        result(x2?"x2":"good");

                                    }).catch(function(ex){
                            //console.log(ex.message)
                                        if (!doOver()) result("bad");
                                    })
                                } catch (ex) {
                            //console.log(ex.message)
                                    if (!doOver()) result("bad");
                                }
                            }
                        }).catch(function(ex){
                            //console.log(ex.message)
                            if (!doOver()) result("bad");
                        });
                    })();
                }, konf.threads);

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