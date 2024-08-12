#!/usr/bin/node
{
    const { komponent, gradient, colors } = require("@sleepwalker/konsole");
    const konsole = komponent("proxy", "red", "><").komponent("wrapper", "hotpink", "><");

    let startup = new Promise(resolve=>{
        const express = require('express'),
            path = require("path"),
            fs = require("fs"),
            async = require("async");

        const m_puppeteer = {
    //  m_experte: require("./modules/puppeteer/experte"),
           m_nova: require("./modules/puppeteer/nova"),
            m_pld: require("./modules/puppeteer/pld"),
          m_space: require("./modules/puppeteer/space"),
    //       m_spys: require("./modules/puppeteer/spysone"),
        } 

        const m_fetch = {
           m_sale: require("./modules/fetch/sale"),
            m_dia: require("./modules/fetch/diatompel"),
            m_fpl: require("./modules/fetch/fpl"),
            m_geo: require("./modules/fetch/geonode"),
        m_hasdata: require("./modules/fetch/hasdata"),
          m_iploc: require("./modules/fetch/iploc"),
          m_royal: require("./modules/fetch/iproyal"),
          m_mtpro: require("./modules/fetch/mtpro"),
        m_vpnfail: require("./modules/fetch/vpnfail"),
          m_world: require("./modules/fetch/world"),
           m_nord: require("./modules/fetch/nord")
        } 
            ///TODO handle new single day trials
            //    m_hide = require("./modules/hidemy"),
            // TODO: Script is broken, likely stuck on a captcha
            //  m_fpls = require("./modules/fpls"),

        const loader = require("./core/cached-scraper");

        const ascii = fs.readFileSync("./ascii", "utf-8");
        console.log(gradient.teen(ascii));

        const app = express();
        app.use("/", express.static(path.join(__dirname, "www")));

        function composeArray(arr) {
            let text = "";
            for (let idx = 0; idx < arr.length; idx++) {
                text += arr[idx] + "\n";
            }
            return text;
        }

        let endpoints = {
            uris: [],
            finished: false
        }

        app.get("/endpoints.loaded", (req, res) => {
            res.contentType("application/json");
            res.send(JSON.stringify(endpoints));
        });

        let m_done = 0;
        let m_total = 0;

        const THREADS = {
            PUPPETEER: 8,
            FETCH: 4
        };

        let queue = async.queue((task, callback) => {
            task().then(callback)
        }, THREADS.FETCH);

/*        let nova_promise = (()=>{
            const 

            return new Promise(resolve=>{
                m_nova.http().then(output=>{
                    let resturi = "/http/proxynova.com";
                    console.log(`Preload Complete: ${resturi} [${output.data.length} proxies]`);

                    app.get(resturi, (req, res) => {
                        (async () => {
                            let puts = await output.loader();
                            res.contentType("text/plain");
                            res.send(composeArray(puts.data));
                        })()
                    });

                    resolve();
                })
            })
        })();*/

        const { puppeteer, simple } = require("@sleepwalker/horde");
        const scraper = puppeteer({
            block: { ads: true, trackers: true, resources: true },
            threads: THREADS.PUPPETEER
        })

        function result_rest_endpoint(output){
            let resturi = `/${output.protocol.toLowerCase()}/${new URL(output.url).host.replace(/^www./, "")}`
            konsole.logger(`Preload Complete: ${colors.cyan(resturi)} [${colors.orange(output.data.length)} proxies]`);
            app.get(resturi, (req, res) => {
                (async () => {
                    let puts = await output.loader();
                    res.contentType("text/plain");
                    res.send(composeArray(puts.data));
                })()
            });
        }

        function process_all_modules() {
            const all_protocols = ['http', 'https', 'socks4', 'socks5'];

            for (const key in m_fetch) {
                let mod_queue = [];
                m_total++

                for (let proto_idx in all_protocols) {
                    proto = all_protocols[proto_idx];
                    if (m_fetch[key][proto]) {
                        function module_proto(task_mm) {
                            mod_queue.push(function(cb) {
                                task_mm().then(output=>{
                                    result_rest_endpoint(output);
                                    cb();

                                }).catch((ex) => {
                                    console.log(ex);
                                    cb();
                                });
                            })
                        }
                        module_proto(m_fetch[key][proto]);
                    }
                }
            
                queue.push(function(){
                    return new Promise(resolve=>{
                        async.series(mod_queue).then(function (){
                            m_done++;
                            konsole.logger(`Completed Module: ${colors.yellow(key)} =||= [ ${colors.hotpink(m_done)} / ${colors.cyan(m_total)} ]`);
                            resolve();
                        });
                    });
                });
            }

            for (const key in m_puppeteer) {
                let mod_queue = [];
                m_puppeteer[key].init(scraper);
                m_total++

                for (let proto_idx in all_protocols) {
                    let proto = all_protocols[proto_idx];
                    if (m_puppeteer[key][proto]) {
                        let this_mod_promise = m_puppeteer[key][proto]();
                        mod_queue.push(this_mod_promise);
                        this_mod_promise.then(result_rest_endpoint)
                            .catch(console.trace);
                    }
                }
                Promise.all(mod_queue).then(function (){
                    m_done++;
                            konsole.logger(`Completed Module: ${colors.yellow(key)} =||= [ ${colors.hotpink(m_done)} / ${colors.cyan(m_total)} ]`);
                })
            }

            queue.drain(function () {
                konsole.logger("------------------------------------------\n[0/2]. fetch queue: complete\n");
                scraper.idle().then(function(){
                    konsole.logger("------------------------------------------\n[1/2]. puppeteer queue: complete\n");
                    scraper.close().then(function(){
                        setTimeout(function(){
                            konsole.logger("[2/2]. preload complete.");
                            endpoints.finished = true;
                            simple({ url: "http://localhost:6660/signal" }).then(function(){
                                resolve();
                            })
                        },2000);
                    })
                })
            })

            let port = 8769;
            app.listen(port, () => konsole.logger(`Started ProxyWrapper: http://localhost:${port}/`));
        }
        
        process_all_modules();
    });

    module.exports = function(){
        return startup;
    }
}
