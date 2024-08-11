const rowparser = require("../core/puppeteer/rowparser")
const client = require('@sleepwalker/client-puppeteer');
const loader = require('../core/cached-scraper');
const urls = require("whatwg-url");

    function parser(main_cb) {
        const url = "http://cybersyndrome.net";

        return loader(url, "http", {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
            client(url, null, (e, d) => {
                if (!e) {
                    const {page, closeout} = d;
                    (async () => {
                        await page.waitForSelector("#content0 table", {timeout: 10000});

                        function findlink() {
                            let links = document.querySelectorAll("#content0 table tr td a")
                            for (let idx in links) {
                                if (links[idx].innerText === "Anonymous") return(links[idx].href);
                            }
                        }

                        let href = await page.evaluate(findlink);
                        if (href) {
                            await page.goto(href);
                            setTimeout(function (){
                                page.evaluate(rowparser,{ selector: "#content ol li a"}).then(result=>main_cb(null,result))
                            },5000);
                        }
                    })()
                }
            })
        })
    }
parser((e,result)=>{
    console.log(e)
    console.log(result)
})