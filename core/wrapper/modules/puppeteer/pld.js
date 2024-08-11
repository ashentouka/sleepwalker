{
    const { rowparser } = require("../../parsers/puppeteer");
    const loader = require('../../core/cached-scraper');
    
    let scraper;

    function runner(proto) {
        let path = `https://proxy-list.download/${proto.toUpperCase()}`;
        
        function parser(cb) {
            let data = [];

            scraper.queue(async ({ page }) => {
                await page.goto(path, {"waitUntil": "domcontentloaded"});
                let last_page = false;

                while(!last_page){
                    await page.waitForSelector("#example1");
                    const proxy = await page.evaluate(rowparser, {selector: "#example1 tr"});
                    data = data.concat(proxy);

                    let pageinfo = await page.evaluate(function () {
                        const PAGE_REX = /Showing[a-z ]+(\d{1,2})[a-z ]+(\d{1,2})/;
                        let ptext = document.getElementById("tpagess").innerText;
                        let pdata = ptext.match(PAGE_REX);
                        return {num: parseInt(pdata[1]), of: parseInt(pdata[2])}
                    });

                    if (pageinfo.num < pageinfo.of) {
                        await page.evaluate(function () {
                            document.querySelector("#example1_next button").click();
                        })
                        await page.waitForSelector("#tpagess");
            
                    } else {
                        last_page = true;
                        page.close();
                        cb(null, data);
                    }
                }
            }).catch(console.trace);
        }

        return function () {
            return loader(path, proto,{ cron: "1 5 * * * *", ttl: { refresh: 60 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        init(client){
            scraper = client
        },
        http: runner("http"),
        https:runner("https"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
   }

}
