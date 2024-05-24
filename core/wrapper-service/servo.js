#!/usr/bin/node
{
    let startup = new Promise(resolve=>{
        const express = require('express'),
            path = require("path"),
            async = require("async"),
            urls = require("whatwg-url"),

            m_spys = require("./modules/spys_one"),
            m_pld = require("./modules/proxy-list-dl"),
            m_vpnfail = require("./modules/vpnfail"),
            m_geo = require("./modules/geonode"),
            m_world = require("./modules/world"),
            m_royal = require("./modules/iproyal"),
            m_mtpro = require("./modules/mtpro"),
            m_dia = require("./modules/diatompel"),

            ///TODO handle new single day trials
            //    m_hide = require("./modules/hidemy"),
            // TODO: Script is broken, likely stuck on a captcha
            //  m_fpls = require("./modules/fpls"),

            loader = require("./core/cached-scraper");

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

        let queue = async.queue((task, callback) => {
            task().then(function (output) {
                let resturi = `/${output.protocol.toLowerCase()}/${urls.basicURLParse(output.url).host.replace(/^www./, "")}`
                console.log(`Preload Complete: ${resturi} [${output.data.length} proxies]`);
                app.get(resturi, (req, res) => {
                    (async () => {
                        let puts = await output.loader();
                        res.contentType("text/plain");
                        res.send(composeArray(puts.data));
                    })()
                });
                callback();
            }).catch((ex) => {
                console.log(ex);
                callback();
            });
        }, 1);

        //   queue.push(m_iploc);

        /*  TODO Disabled until script is fixed... captcha?
            queue.push(m_fpls)*/

        queue.push(function() {
            const parser = require("./core/puppeteer/parser-puppeteer");
            const url = "https://openproxy.space/list/http";
            return loader(url, "http", {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
                parser.text(url, {
                    selector: "section.data textarea"
                }, cb);
            })
        })

    /*    queue.push(function () {
            const parser = require("./core/puppeteer/parser-puppeteer");
            const url = "https://proxynova.com/proxy-server-list";
            return loader(url, "http", {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
                parser.paged(url, {
                    selector: "#tbl_proxy_list tbody tr",
                    namedpages: ["/anonymous-proxies/", "/elite-proxies/"]
                }, cb);
            })
        })*/

        queue.push(function () {
            const parser = require("./core/simple/parser-simple");
            const url = "https://free-proxy-list.net";
            return loader(url, "http", {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
                parser.table(url, {selector: "div.fpl-list table tbody tr"}, cb);
            })
        })

        const armada_protocols = ["http", "socks4", "socks5"];
        for (let proto_idx in armada_protocols) {
            let proto = armada_protocols[proto_idx];
            queue.push(m_world[proto]);
            queue.push(m_vpnfail[proto]);
            queue.push(m_geo[proto]);
        }

        const all_protocols = ['http', 'https', 'socks4', 'socks5'];
        for (let proto_idx in all_protocols) {
            let proto = all_protocols[proto_idx];
            queue.push(m_pld[proto]);
            queue.push(m_royal[proto]);
           // queue.push(m_hide[proto]);
        }

        let spys_protocols = ['http', 'socks5'];
        for (let proto_idx in spys_protocols) {
            let proto = spys_protocols[proto_idx];
            queue.push(m_spys[proto])
        }

        queue.push(m_mtpro.socks5());

        let dia_protocols = ['http', 'https', 'socks5'];
        for (let proto_idx in dia_protocols) {
            let proto = dia_protocols[proto_idx];
            queue.push(m_dia[proto])
        }

        queue.drain(function () {
            console.log("Preload Complete.");
            endpoints.finished = true;
            resolve();
        })

        let port = process.env["PORT"] || 7769;
        app.listen(port, () => console.log(`http://localhost:${port}/`));
    });

    module.exports = function(){
        return startup;
    }
}