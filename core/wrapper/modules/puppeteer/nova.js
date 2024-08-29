{
    const url = "https://www.proxynova.com/proxy-server-list";

    const namedpages = [
        "/anonymous-proxies/", "/elite-proxies/",
        "/country-us/","/country-ca/","/country-br/","/country-ve/","/country-ar/",
        "/country-uk/","/country-fr/","/country-ru/","/country-ua/","/country-de/",
        "/country-pl/","/country-jp/","/country-sg/","/country-kr/","/country-th/",
        "/country-id/","/country-tw/","/country-hk/","/country-co/","/country-in/",
        "/country-iq/","/country-ir/","/country-mx/","/country-pe/","/country-za/"
    ];

    const loader = require("../../core/cached-scraper");
    const parser = require("../../core/parsers/hybrid");

    const cheerio = require("cheerio");

    let scraper;
    let tried={};

    function proxynova() {
        let proxy_data = [];
        let comp = 0;

        function load_impl(url, source, cb){
            (async()=>{

                function named_page_queue(pageout) {
                    scraper.queue(async ({ page }) => {
                        try {
                            await page.goto(url + pageout);
                            let html = await page.content();
                            const $ = cheerio.load(html);

                            const data = await parser.table($, source);
                            proxy_data = proxy_data.concat(data);
                            console.log(`${url+pageout}=${data.length},(${proxy_data.length} total) |[ ${comp++} / ${namedpages.length} ]| // PRoXYNoVa`);
                        } catch(ex){
                            //console.log(ex);
                            if (!tried[pageout] || tried[pageout] < 3){
                                tried[pageout] = (tried[pageout] ? (tried[pageout] + 1) : 0);
                                named_page_queue(pageout);
                            }
                        } finally {
                            await page.close();
                        }
                    });
                }

                for (const npx in namedpages) {
                    named_page_queue(namedpages[npx]);
                }

                await scraper.idle();
                await scraper.close();

                cb(null,proxy_data);
            })()
        }
        
        return function () {
            return loader(url, "http", { ttl: { refresh: 30 * 60 * 1000 }, auto: 30 * 60 * 1000 },function (cb){
                load_impl(url, {selector: "#tbl_proxy_list tbody tr", namedpages }, cb);
            });
        }
    }

    module.exports = {
        init(client){
            scraper = client
        },
        http: proxynova()
    }
}