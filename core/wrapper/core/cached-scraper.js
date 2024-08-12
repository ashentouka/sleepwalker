{
    const DEBUG = false;

    const CACHE_TTL_UPSTREAM_OKAY_MINUTES = 120;
    const CACHE_TTL_ON_ERROR_MINUTES = 240;

//    const urls = require("whatwg-url");
    const schedule = require("node-schedule");

    function loadNew(uri, protocol, opts, f) {
        opts ||= { ttl:{}, noReject: true };
        opts.ttl ||= {};
        opts.ttl.refesh ||= CACHE_TTL_UPSTREAM_OKAY_MINUTES * 60 * 1000;
        opts.ttl.error ||= CACHE_TTL_ON_ERROR_MINUTES * 60 * 1000;

        const datasource = require("./ds_json_f");
        let resturi = `${protocol.toLowerCase()}_${new URL(uri).host.replace(/^www./, "")}`;

        let lastchange;
        let laststamp;

        function bypasscache(retries){
            return new Promise((resolve, reject) => {;

                f((e, d) => {
                    if (e) {
                        if (DEBUG) {
                            console.log(resturi);
                            console.log(`there was an error...`);
                            console.log(e.message);
                        }
                        if (retries && retries > 2) {
                            if (DEBUG) console.log(`attempted ${retries} retries, send error to client.`);
                            if (!opts.noReject) {
                                reject(e);
                            } else {
                                resolve(out);
                            }
                        } else {
                            if (out.loaded === 0 || millis > opts.ttl.error) {
                                if (DEBUG) console.log(`...cache is too stale or has no data, attempting one retry.`);
                                setTimeout(() => {
                                    bypasscache(retries ? retries + 1 : 1)
                                        .then(resolve)
                                        .catch(reject);
                                }, 500);
                            } else {
                                if (DEBUG) console.log(`...returning last good cache.`);
                                resolve(out);
                            }
                        }
                    } else {
                        (async () => {
                            out = {loaded: new Date().getTime(), protocol:protocol, url: uri, data: d};
                            if (DEBUG) console.log(`scraped fresh data from the source html [${out.data.length} entries]`);

                            if (opts.track) {
                                const crypto = require('crypto');
                                const hash = crypto.createHash('md5').update(JSON.stringify(out.data)).digest("hex");
                                if (lastchange !== hash) {
                                    if (lastchange) console.log(`/${protocol}/${resturi} actual data change: ${(new Date().getTime() - laststamp) / (60 * 1000)} minutes`);
                                    lastchange = hash;
                                    laststamp = new Date().getTime();
                                }
                            }

                            await datasource.updateCache(resturi, out);
                            resolve(out);
                        })();
                    }
                })
            });
        }

        function load() {
            return new Promise((__resolve, __reject) => {

                (async function() {
                    let out = await datasource.loadCache(resturi);
                    out ||= { loaded: 0, url: uri, protocol:protocol, data: []};

                    let millis = new Date().getTime() - out.loaded;
                    if (DEBUG && out.loaded > 0) console.log(`cache entry age [${millis / 1000} seconds][ttl: ${opts.ttl.refesh}]`);
                    
                    function reject(e){
                        if (!opts.noReject) {
                            __reject(e);
                        } else {
                            resolve(out);
                        }
                    }

                    function resolve(obj) {
                        obj.loader = load;
                        __resolve(obj);
                    }

                    if (out.loaded === 0 || millis > opts.ttl.refesh) {
                        try {
                            bypasscache().then(resolve).catch(reject);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        if (DEBUG) console.log(`cache data is "new" enough [${out.data.length} entries]`);
                        resolve(out);
                    }
                })()
            });
        }
        
        if (opts.auto) {
            setInterval(function(){
                if (DEBUG) console.log(`/${protocol}/${resturi} auto-refresh`);
                bypasscache()
            },opts.auto)
        } else if (opts.cron) {
            function crontrigger(str){
                const job = schedule.scheduleJob(str, function() {
                    if (DEBUG) console.log(`/${protocol}/${resturi} cron triggered`);
                    bypasscache()
                });
            }
            if (opts.cron instanceof Array) { 
                opts.cron.forEach(crontrigger);
            } else {
                crontrigger(opts.cron);
            }
        }

        return load();
    }

    module.exports = loadNew;
}