{
    const rowparser = require("../core/puppeteer/rowparser")
    const client = require('@sleepwalker/client-puppeteer');
    const loader = require('../core/cached-scraper');

    function runner() {

        function parser(cb) {
            let data = []
            let pager = 1;
            client("https://www.google.com/search?q=freeproxylists.net", {}, (e, d) => {
                if (e) cb(e);
                else {
                    (async () => {
                        const {page, closeout} = d;
                        /*
                        await page.waitForSelector("#search a");
                        console.log("a");

                        let linkct = await page.evaluate(function () {
                            let links = document.querySelectorAll("#search a");
                            links[0].click();
                            return links[0].href;
                        })*/

                        const link_done = await page.evaluate(function (){
                            const cl_link = document.createElement("a");
                            cl_link.href = "https://www.freeproxylists.net";
                            document.body.appendChild(cl_link);
                            cl_link.click();
                            return "fin.";
                        })

                        //await page.click("#search a");
                        console.log("click", link_done);

                        async function paged() {

                            try {
                                await page.waitForNavigation({waitUntil: "domcontentloaded"});
                               await page.waitForTimeout(3000);
                                let html = await page.evaluate(function (){
                                    return document.body.innerHTML;
                                })
                                console.log(html);
                                console.log(html.indexOf("DataGrid"));
                                await page.waitForSelector("table.DataGrid");

                                console.log("table", pager);
                                //if (pager === 1) await page.waitForTimeout(3000);
                                const proxy = await page.evaluate(rowparser, {selector: "tr.Even,tr.Odd"});
                                data = data.concat(proxy);

                                console.log("rowparser");

                                let clicker = await page.evaluate(function () {
                                    let link = document.querySelectorAll("span.current + a");

                                    console.log(link.length);
                                    if (link.length > 0) {
                                        link[0].click();
                                    }
                                    return link.length;
                                })

                                console.log(`page ${pager}: ${proxy.length}`);

                                if (clicker > 0) {
                                    pager++;
                                    await paged();
                                } else {
                                    closeout();
                                    cb(null, data);
                                }
                            } catch (exx) {
                                closeout()
                                cb(exx);
                            }
                        }

                        await paged();
                    })()
                }
            })
        }

        return function () {
            return loader(`https://freeproxylists.net`, "http", { auto: 2 * 60 * 1000, ttl: { refresh: 1 * 60 * 1000 }}, parser);
        }
    }

    module.exports = runner();
    module.exports()
}