#!/usr/bin/node
{
    let startup = new Promise(resolve=>{
        const express = require('express'),
            path = require("path"),
            async = require("async"),
            urls = require("whatwg-url");

        const m_all = {
           m_nova: require("./modules/nova"),
            m_dia: require("./modules/diatompel"),
    //  m_experte: require("./modules/experte"),
            m_fpl: require("./modules/fpl"),
            m_geo: require("./modules/geonode"),
        m_hasdata: require("./modules/hasdata"),
          m_iploc: require("./modules/iploc"),
          m_royal: require("./modules/iproyal"),
          m_mtpro: require("./modules/mtpro"),
    //   m_pld: require("./modules/pld"),
          m_space: require("./modules/space"),
           m_spys: require("./modules/spysone"),
        m_vpnfail: require("./modules/vpnfail"),
          m_world: require("./modules/world")
        } 
            ///TODO handle new single day trials
            //    m_hide = require("./modules/hidemy"),
            // TODO: Script is broken, likely stuck on a captcha
            //  m_fpls = require("./modules/fpls"),

        const loader = require("./core/cached-scraper");

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

        let queue = async.queue((task, callback) => {
            task().then(callback)
        }, 5);

        const all_protocols = ['http', 'https', 'socks4', 'socks5'];

        for (const key in m_all) {
            let mod_queue = [];
            m_total++;

            for (let proto_idx in all_protocols) {
                let proto = all_protocols[proto_idx];

                if (m_all[key][proto]) {
                    mod_queue.push(function(cb) {
                        m_all[key][proto]().then(output=>{
                            let resturi = `/${output.protocol.toLowerCase()}/${urls.basicURLParse(output.url).host.replace(/^www./, "")}`
                            console.log(`Preload Complete: ${resturi} [${output.data.length} proxies]`);
                            app.get(resturi, (req, res) => {
                                (async () => {
                                    let puts = await output.loader();
                                    res.contentType("text/plain");
                                    res.send(composeArray(puts.data));
                                })()
                            });

                            cb();

                        }).catch((ex) => {
                            console.log(ex);
                            cb();
                        });
                    })
                }
            }
        
            queue.push(function(){
                return new Promise(resolve=>{
                    async.series(mod_queue).then(function (){
                        m_done++;
                        console.log(`Completed Module: ${key} =||= [ ${m_done} / ${m_total} ]`);
                        resolve();
                    });
                });
            });
        }

        queue.drain(function () {
            console.log("Preload Complete.");
            endpoints.finished = true;
            resolve();
        })

        let port = 6669;
        app.listen(port, () => console.log(`Started Wrapper: http://localhost:${port}/`));

    });

    module.exports = function(){
        return startup;
    }
}
