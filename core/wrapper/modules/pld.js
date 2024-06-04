{
    const rowparser = require("../core/puppeteer/rowparser")
    const client = require('@sleepwalker/client-puppeteer');
    const loader = require('../core/cached-scraper');

    function runner(proto) {
        let path = `https://proxy-list.download/${proto}`;

        function parser(cb) {
            let data = [];

            client({}).client(path).then(page => {
                function next() {
                    (async () => {
                        await page.waitForSelector("#example1");
                        const proxy = await page.evaluate(rowparser, {selector: "#example1 tr"});
                        data = data.concat(proxy);

                        let pageinfo = await page.evaluate(function () {
                            const PAGE_REX = /Showing[a-z ]+(\d{1,2})[a-z ]+(\d{1,2})/;
                            let ptext = document.getElementById("tpagess").innerText;
                            let pdata = ptext.match(PAGE_REX);
                            return {num: parseInt(pdata[1]), of: parseInt(pdata[2])}
                        });

                       // console.log(`Page ${pageinfo.num} of ${pageinfo.of}: ${proxy.length} ${proto} proxy`)
                        if (pageinfo.num < pageinfo.of) {
                            await page.evaluate(function () {
                                document.querySelector("#example1_next button").click();
                            })
                            await page.waitForSelector("#tpagess");
                            next();
                        } else {
                            page.close();
                            cb(null, data);
                        }

                    })();
                }

                next();
            });
        }

        return function () {
            return loader(path, proto,{ ttl: { refresh: 15 * 60 * 1000 }, auto: 20 * 60 * 1000 }, parser);
        }
    }

    module.exports = {
        socks5: runner("SOCKS5"),
        socks4: runner("SOCKS4"),
        http: runner("HTTP"),
        https: runner("HTTPS"),
    }

}
