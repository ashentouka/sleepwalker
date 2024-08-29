{
    const loader = require('../../core/cached-scraper');
    const { client, async } = require("@sleepwalker/router").horde.simple;
    const Tesseract = require('tesseract.js');
    const scheduler = Tesseract.createScheduler();
    const path = require("path");
    const fs = require("fs");
    const os = require("os");

    const TESSERACT_WORKERS = 5;
    const cachefile = os.homedir()+"/.sleepwalker/proxysale.tesseract.json";

    const SITE = "https://free.proxy-sale.com";

    let queue = [];
    let protocache = {
        http:[],
        https:[],
        socks4:[],
        socks5:[]
    };
    let promise;
    let cache = (function(){
        if (fs.existsSync(cachefile)) return require(cachefile);
        else return {};
    })();

    function runner(proto) {
        let pageout = SITE + "/api/front/main/pagination/filtration";

        function parser(cb) {
            if (proto === "http") {
                promise = new Promise(resolve => {
            		let page = 0, pages = 1;
            		(async function nextpage(){
        			    const data = { page,"size":1000,"countries":[],"proxyProtocols":[],"proxyTypes":[]};
                        const response = await client({ url: pageout, method: "post", data, datatype: "json", accept: "json" });
                    	pages = response.data.totalPages;
                        for (let prx in response.data.content) {
                        	queue.push(response.data.content[prx]);
                        }
                        page++;
                        if (page < pages){
                            nextpage();
                        } else {
                            queuepart2();
                        }
                    })();
	                
                    async function queuepart2() {
                        for (let i = 0; i < TESSERACT_WORKERS; i++) {
                            const worker = await Tesseract.createWorker('eng');
                            scheduler.addWorker(worker);
                        }
                        let promises = [];
                        for (let proxy of queue){
                            function assemble(port){
                                const url = `${proxy.ip}:${port}`;
                                protocache[proxy.proxyType.toLowerCase()].push(url);
                            }
                            if (cache[proxy.portImageUrl]){
                                assemble(cache[proxy.portImageUrl])
                            } else {
                                let p = scheduler.addJob('recognize', SITE+proxy.portImageUrl);
                                promises.push(p);
                                p.then(rep => {
                                    cache[proxy.portImageUrl]=rep.data.text.trim();
                                    fs.writeFileSync(cachefile, JSON.stringify(cache,null,2));
                                    assemble(rep.data.text.trim()) 
                                });
                            }
                        }

                        
                        await Promise.all(promises);
                        await scheduler.terminate();

                        cb(null,protocache["http"]);
                        resolve();
                    }
                });
            } else {
                promise.then(function(){
                    cb(null,protocache[proto]);
                });
            }
        }

        return function () {
            return loader(pageout, proto, { cron: [ "25 * * * *",  "55 * * * *"  ], ttl: { refresh: 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        http: runner("http"),
        https: runner("https"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }

}