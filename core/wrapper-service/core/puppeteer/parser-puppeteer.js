{
    const client = require("@sleepwalker/client-puppeteer");

    let api = {
        text(path, source, cb) {
            try {
                (async () => {
                    const page = await client({}).client(path);
                    await page.waitForSelector(source.selector, 10000);
                    const text = await page.evaluate(function(source){
                        let block = document.querySelector(source.selector);
                        return block.value.split("\n");
                    }, source)
                    page.close();

                    cb(null, text);
                })();
            } catch (e) {
                cb(e);
            }
        },

        table(path, source, cb) {
            try {
                (async () => {
                    const rowparser = require("./rowparser");
                    const page = await client({}).client(path);
                    await page.waitForSelector(source.selector, 10000);
                    const text = await page.evaluate(rowparser, source)
                    page.close();
                    
                    cb(null, text);
                })();
            } catch (e) {
                cb(e);
            }
        },

        paged(path, source, cb) {
            let proxy_data = [];

            function _prox(pg) {
                const pageout = (source.namedpages) ? source.namedpages[pg - 1] : pg;
                api.table(path + pageout, source, (e, d) => {

                    if (e) {
                        console.log(e.message);
                        cb(e)

                    } else {
                        proxy_data = proxy_data.concat(d)
                        if (pg < source.maxpage || pg < source.namedpages.length) {
                            setTimeout(function () {
                                _prox(pg + 1)
                            }, 500);
                        } else {
                            cb(null, proxy_data);
                        }
                    }
                });
            }

            _prox(1);
        },


        typetable(path, source, cb, __outp) {
            try {
                (async () => {
                    const rowparser = require("./rowparser-types");
                    const page = await client({}).client(path);
                    await page.waitForSelector(source.selector, 10000);
                    let outp = await page.evaluate(rowparser, { source, __outp })
                    page.close();
                    
                    cb(null, outp);
                })();
            } catch (e) {
                cb(e);
            }
        },

        typepaged (path, source, cb) {

            let total = 0;

            function _prox(pg,datapass) {
                api.typetable(path+pg,source, (e,d)=>{
                    if (e) {
                        console.log(e.message);
                        cb(e)

                    } else {
                        if (DEBUG) console.log(total,d.total);
                        if (d.total > total) {
                            total = d.total;
                            setTimeout(function (){_prox(pg + 1,d)},100);
                        } else {
                            cb(null,d);
                        }
                    }
                },datapass);
            }
            _prox(1);
        },
    }

    module.exports = api;
}