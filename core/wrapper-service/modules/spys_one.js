{
    const DEBUG = false;

    const rowparser = require("../core/puppeteer/rowparser");
    const client = require('@sleepwalker/client-puppeteer');
    const loader = require('../core/cached-scraper');

    function runner(proto,pathVar) {
        let path = `https://spys.one/en/${pathVar}-proxy-list/`;

        function parser(cb) {
             const puppeteer = client({
                Cookie: "cf_chl_3=1bcb758502052ee; cf_clearance=Pieh1lk.iTQXAJYfTpcTGD2Udl5D5WUzgY4_Ed3Bf1I-1713104766-1.0.1.1-iJcjin1z3fBOXk0z940MLkL3RqGrykyHg.PeLJvJlh.idYM.6iucu5UpKs_.brXc2lzxO6LUca9TGgKA01ucvQ; _ga=GA1.1.729296813.1713104782; __gads=ID=ff0fe32db8f3e602:T=1713104782:RT=1713104782:S=ALNI_MYmVCfkGd5zfS5pmFzK4Ei0RmfRoA; __gpi=UID=00000dde82de008f:T=1713104782:RT=1713104782:S=ALNI_Mbj9k1uQh2v4E0jIUsqylfW8KmKmA; __eoi=ID=ff03fdcacbb80ae5:T=1713104782:RT=1713104782:S=AA-AfjbDfFGTvCVn2tZCREUWcxtf; FCNEC=%5B%5B%22AKsRol-nHyEPAZNNZUDgemz0sEeWvsNiQhwo1yrfoFr8lPcLCx0x3nTyOewLc6TGgq4dtLkqYio3slPEm7wqTIR209X0Bihgx-kAXiHy_5uSPVpFSny0VFwrEaQZIxNK8LylCtgbj5S3kj-ilGHQZ0BvioocPHtpnw%3D%3D%22%5D%5D; _ga_XWX5S73YKH=GS1.1.1713104782.1.1.1713104834.0.0.0"
            });
             puppeteer.plugins.stealth();
             puppeteer.client(path).then(page => {

                function evalFilter(submit) {
                    (async () => {
                        try {
                        await page.waitForSelector("body table table");
                        const rows = await page.evaluate(function () {
                            let trz = document.querySelectorAll("tr.spy1x,tr.spy1xx");
                            return trz ? trz.length : 0;
                        });

                        if (DEBUG) console.log("spys.one", proto, rows);

                        if (rows < 100) {
                            if (!submit) {
                                await page.waitForSelector("#xpp");
                                await page.evaluate(function () {
                                    let selbox = document.getElementById('xpp');
                                    selbox.selectedIndex = 5;
                                    selbox.form.submit()
                                });
                                await page.waitForNavigation({waitUntil: "domcontentloaded"});
                                if (DEBUG) console.log("filter changed");
                                evalFilter(true);

                            } else {
                                await page.reload({waitUntil: "domcontentloaded"});
                                setTimeout(function () {
                                    if (DEBUG) console.log("filter error trying refresh");
                                    evalFilter(false)
                                }, 500);
                            }

                        } else {
                            const text = await page.evaluate(rowparser, {selector: "tr.spy1x,tr.spy1xx"});
                            page.close();
                            cb(null, text);
                        }
                    } catch(ex) {
                        await page.screenshot({ path: 'spys.png', fullPage: true });
                         const htmlel = await page.$("html");
                        const html = await page.evaluate(el=>el.outerHTML,htmlel);
                        fs.writeFileSync("spys.html", html);
                        await page.close();
                        cb(ex);
                    }
                    })();
                }

                evalFilter(false);
            }).catch(e=>{
                cb(e);
            });
        }

        return function () {
            return loader(path, proto,{ ttl: { refresh: 15 * 60 * 1000 }, auto: 30 * 60 * 1000 }, parser);
        }
    }

    module.exports = {
        http: runner("http","http"),
        socks5: runner("socks5","socks")
    }
}
