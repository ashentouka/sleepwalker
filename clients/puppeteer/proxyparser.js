{
    const client = require('./infectorVector.js');

   function _abstract_(_evaluation_) {
        return function (path, source, cb) {
                client.client(path).then(async page => {

                            if (source.exec) {
                                if (source["select-wait"]) await page.waitForSelector(source["select-wait"]);
                                let eval_f = new Function("source", source.exec);

                                await page.evaluate(eval_f, source);
                                await page.waitForTimeout(1000);
                                await page.waitForNavigation(30000);
                            }

                            if (source.scroller) {
                                await page.waitForTimeout(1000);
                                await page.evaluate((source) => {
                                    window.scrollTo(0, source.scroller)
                                }, source);
                                await page.waitForTimeout(1000);
                            }

                            const text = await page.evaluate(_evaluation_, source);
                            cb(null, text);
                        }).catch(e=>{
                            //console.log(e)
                    cb(e)
                })

        }
    }

    module.exports = {
        puppeteer: _abstract_(function (source) {
            let vv = document.querySelector(source.selector);
            if (vv) {
                return vv.value;
            }
        }),

        table: _abstract_(function (source) {
            const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;
            const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

            if (source.exec){
                eval(source.exec);
            }
            let vv = document.querySelectorAll(source.selector);
            if (vv) {
                let outp = [];
                let cs = {};
                for (let idx = 0; idx < vv.length; idx++){
                    let cells = vv[idx].querySelectorAll("td");
                    cs[idx] = cells;
                    if (typeof source["cell-ip-port"] !== "undefined"){
                        let ip = cells[source["cell-ip-port"]].innerText;
                        if (ip_port_regex.test(ip)) {
                            outp.push(ip);
                        }
                    } else {
                        let ip = cells[source["cell-ip"] || 0].innerText;
                        if (ip_regex.test(ip)) {
                            let port = cells[source["cell-port"] || 1].innerText;
                            outp.push(`${ip}:${port}`);
                        }
                    }
                }
                return outp;
            }
        }),

        links: _abstract_(function (source) {

            let context = (!source.selectors.rows && source.selectors.links) ?
                {selectLinks: true, selector: source.selectors.links, results: []} :
                {selectLinks: false, selector: source.selectors.rows, results: []};

            let link_rows = document.querySelectorAll(context.selector);
            context.rows = link_rows.length;

            for (let idx = 0; idx < link_rows.length && (typeof source.limit === "undefined" || idx < source.limit); idx++) {
                let row = link_rows[idx];

                let type = row.querySelector(source.selectors.protocol).innerText.toLowerCase();
                let href = (context.selectLinks) ? row.href : row.querySelector(source.selectors.href).href;
                let splitty = href.indexOf("/", 8);
                let site = href.substring(0,splitty);
                href = href.substring(splitty);

                context.results.push(Object.assign({
                    site: site,
                    [type]: href
                }, source.creates));
            }
            return context;
        })

    }
}