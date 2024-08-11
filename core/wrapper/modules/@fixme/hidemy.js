{
    const rowparser = require("../core/puppeteer/rowparser")
    const client = require('@sleepwalker/client-puppeteer');
    const loader = require('../core/cached-scraper');

    function runner(proto, pathVar) {
        let urlbase = `https://hidemy.name/en/proxy-list/?type=${pathVar}`;
        let hash = "#list";
        function parser(cb) {
            let data = []
            let pager = 1;
            client().client(urlbase + hash).then(d=>{
                console.log(urlbase+hash);
                // if (e) cb(e);
                // else {
                    const { page, closeout } = d;
                    (async () => {
                        async function paged() {
                           // console.log (await page.evaluate(function (){ return document.body.innerText }));
                            await page.waitForSelector("div.table_block table");
                           // await page.waitForTimeout(1000);
                                const proxy = await page.evaluate(rowparser, {selector: "div.table_block table tbody tr"});
                                data = data.concat(proxy);

                                let clicker = await page.evaluate(function (pager){
                                    let link = document.querySelectorAll(pager > 1 ? ".pagination li.active + li" : ".pagination li.is-active + li");
                                    if (link.length > 0 && link[0].className === "next_array") link = [];
                                    return link.length;
                                },pager);

                             //   console.log(`page ${pager}: ${proxy.length}`);

                                if (clicker > 0 && pager < 20) {
                                    await page.goto(urlbase + "&start=" + (64*pager) + hash);
                console.log(urlbase + "&start=" + (64*pager) + hash);
                                    pager++;
                                    //await page.waitForNavigation({waitUntil: "domcontentloaded"});
                                    await paged();
                                } else {
                                    cb(null,data);
                                    closeout();
                                }
                        }

                        await paged();
                    })()
           //     }
            })
        }

        return function () {
            return loader(urlbase, proto, {ttl: { refresh: 20 * 60 * 1000 }, auto: 30 * 60 * 1000}, parser);
        }
    }

    module.exports = {
        "socks4": runner("socks4","4"),
        "socks5": runner("socks5","5"),
        "http": runner("http","h"),
        "https": runner("https","s"),
    };

    if (require.main === module) {
        let f = module.exports.http().then(d=>{

        console.log(d); 
        });
    }
}