#!/usr/bin/node
{
    const { komponent, gradient, colors } = require("@sleepwalker/router").konsole;
    const konsole = komponent("proxy", "red", "><").komponent("wrapper", "hotpink", "><");

    let startup = new Promise(resolve=>{
        const express = require('express'),
            fs = require("fs"),
            path = require("path"),
            async = require("async"),
            os = require("os");

        const m_puppeteer = {
    //  m_experte: require("./modules/puppeteer/experte"),
           m_nova: require("./modules/puppeteer/nova"),
            m_pld: require("./modules/puppeteer/pld"),
          m_space: require("./modules/puppeteer/space"),
    //       m_spys: require("./modules/puppeteer/spysone"),
        } 

        const m_axios = {
           m_sale: require("./modules/axios/sale"),
            m_dia: require("./modules/axios/diatompel"),
            m_fpl: require("./modules/axios/fpl"),
            m_geo: require("./modules/axios/geonode"),
        m_hasdata: require("./modules/axios/hasdata"),
    //      m_iploc: require("./modules/axios/iploc"),
          m_royal: require("./modules/axios/iproyal"),
          m_mtpro: require("./modules/axios/mtpro"),
        m_vpnfail: require("./modules/axios/vpnfail"),
          m_world: require("./modules/axios/world"),
           m_nord: require("./modules/axios/nord")
        } 
            ///TODO handle new single day trials
            //    m_hide = require("./modules/hidemy"),
            // TODO: Script is broken, likely stuck on a captcha
            //  m_fpls = require("./modules/fpls"),

        const loader = require("./core/cached-scraper");

        const ascii = fs.readFileSync("./ascii", "utf-8");
        console.log(gradient.teen(ascii));

        const app = express();
        //app.use("/", express.static(path.join(__dirname, "www")));

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
            AXIOS: 4
        };

        let queue = async.queue((task, callback) => {
            task().then(callback)
        }, THREADS.AXIOS);

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

        const { cluster, client } = (()=>{ let ho = require("@sleepwalker/router").horde;
            let cluster = ho.puppeteer.cluster, client = ho.simple.client;
            return { cluster, client }})()
        const scraper = cluster({
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

            for (const key in m_axios) {
                let mod_queue = [];
                m_total++

                for (let proto_idx in all_protocols) {
                    proto = all_protocols[proto_idx];
                    if (m_axios[key][proto]) {
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
                        module_proto(m_axios[key][proto]);
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
                konsole.logger("------------------------------------------\n[0/2]. axios queue: complete\n");
                scraper.idle().then(function(){
                    konsole.logger("------------------------------------------\n[1/2]. puppeteer queue: complete\n");
                    scraper.close().then(function(){
                        setTimeout(function(){
                            konsole.logger("[2/2]. preload complete.");
                            endpoints.finished = true;
                            client({ url: "http://localhost:6660/signal" }).then(function(){
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
