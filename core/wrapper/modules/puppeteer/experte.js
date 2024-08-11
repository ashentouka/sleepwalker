{
    const { typesparser } = require("../../parsers/simple");
    const loader = require('../../core/cached-scraper');

    let protocache;
    let promise;
    let client;

    function runner(proto) {
        let path = `https://www.experte.com/proxy-server`;

        function parser(cb) {
            if (proto === "https") {
                promise = new Promise(resolve => {

                    (async()=>{ 
                        try{
                        //const page = await client({}).client(path);
                        client.queue(async ({ page }) => {

                        console.log("page");
                        await page.screenshot({ path: 'experte.png', fullPage: true });
                        const html_promise = await page.evaluate(function({debug}){
                                return new Promise(html_resolve=>{
                                    let started = false;

                                    function check(){
                                        let btn = document.querySelector("div.mx-auto div.btn");
                                        if (btn) {
                                            if (!started) debug("found the button");
                                            started = true;
                                            debug(document.querySelectorAll("proxies div table tbody tr").length, "rows, click it.");
                                            btn.click();
                                            setTimeout(check, 100);
                                        } else if (!started) {
                                            setTimeout(check, 100);
                                        } else {
                                            debug("did not found button, I ... resolve?");
                                            html_resolve(document.querySelector("proxies div table").outerHTML);
                                        }
                                    }
                                    check();
                                })
                        }, { debug: console.log });
                        console.log ("html", html_promise);

                        const html = await html_promise;
                            html_promise.then(html=>{
                                const $=cheerio.load(html);
                                let data = typesparser({ $, source: { selector: "table tbody tr" }});
                            })
                        //});

                            
            })
                        } catch(e){
                            console.log(e);
                        }

                    })();

                    // rowparser.typetable(path, { selector: "body > main > section.astro-lmapxigl > div.astro-lmapxigl > div.astro-lmapxigl > div.grid", 
                    //     cell: "div.flex", maxpage: 100, skiprow: true }, function(e,d){

                    //     if (d) {
                    //         protocache = d;
                    //         resolve();
                    //         cb(null, d.types.http);
                    //     } else {
                    //         resolve();
                    //         cb(e);
                    //     }
                    // });
                });
            } else {
                promise.then(function(){
                    cb(null,protocache.types[proto]);
                });
            }
        }

        return function () {
            return loader(path, proto, { cron: '0 * * * *', ttl: { refresh: 10 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        init(scraper){
            client = scraper
        },
        https: runner("https"),
        socks5: runner("socks5")
    }
}