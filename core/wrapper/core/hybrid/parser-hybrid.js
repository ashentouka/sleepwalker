{
    const DEBUG = false;

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

    const client = function() {
   		const p_cl = require("@sleepwalker/client-puppeteer");
   		return {
	   		hybrid(path) {
	   			return new Promise((resolve, reject) => {
		            try {
		                (async () => {
		                	if (DEBUG) console.log(`client [hybrid] url [${path}]`);
		                	
		                    const page = await p_cl({}).client(path);
		                    const html = await page.evaluate(function(){
		                        return document.querySelector("html").outerHTML;
		                    });
		                    page.close();

		                    const cheerio = require("cheerio");
		                    resolve(cheerio.load(html));
		                })();
		            } catch (e) {
		                reject(e);
		            }
	            })
	        }
	    }
	}
 
    let api = {
        text(path, source, cb) {
        	client().hybrid(path).then($=>{
				let $block = $(source.selector);
				let output = ($block) ? $block.value().split("\n") : [];
                cb(null, output);
            })
        },

        paged (path, source, cb) {
            let proxy_data = [];
            function _prox(pg) {
                const pageout = (source.namedpages) ? source.namedpages[pg - 1] : pg;
                api.table(path + pageout, source, (e, d) => {
                    if (e) {
                        if (DEBUG) console.log(e.message);
                        cb(e)

                    } else if (d.length > 0 || source.namedpages) {
                        proxy_data = proxy_data.concat(d)
                        if (pg < source.maxpage || pg < source.namedpages.length) {
                            setTimeout(function (){_prox(pg + 1)},500);
                        } else {
                            cb(null,proxy_data);
                        }
                    } else {
                        cb(null,proxy_data);
                    }
                });
            }
            _prox(1);
        },

        table (path, source, cb) {
            if (DEBUG) console.log(`client [hybrid] method [table] url [${path}]`);
            client().hybrid(path).then($=>{
				let rows = $(source.selector);
                if (DEBUG) console.log("rows",rows.length);
                let outp = [];
                for (let idx = source.skiprow ? 1 : 0; idx < rows.length; idx++){
                    let cellsel = source.cell || "td";
                    let cells = $(rows[idx]).find(cellsel);
                    if (DEBUG) console.log("cells", cellsel, cells.length);

                    let scripts = $(cells[0]).find("script");
                    if (scripts) $(scripts[0]).text("");

                    let ip = $(cells[0]).text().trim();
                    if (ip_port_regex.test(ip)) {
                        outp.push(ip);
                    } else if (ip_regex.test(ip)) {
                        let port = $(cells[1]).text().trim();
                        let ip_port = `${ip}:${port}`;
                        if (ip_port_regex.test(ip_port)) 
                        outp.push(ip_port);
                    }
                }
                cb(null,outp);
            });

        },

        typepaged (path, source, cb) {

            let total = 0;

            function _prox(pg,datapass) {
                api.typetable(path+pg,source, (e,d)=>{
                    if (e) {
                        if (DEBUG) console.log(e.message);
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

        typetable (path, source, cb, __outp) {

            if (DEBUG) console.log(`client [simple] method [typetable] url [${path}]`);
            let outp = __outp || { total: 0, types: {http:[],https:[],socks4:[],socks5:[]}};
            
            client().hybrid(path).then($=>{
                let rows = $(source.selector);
                if (DEBUG) console.log("rows",rows.length);
                for (let idx = source.skiprow ? 1 : 0; idx < rows.length; idx++){
                    let cellsel = source.cell || "td";
                    let cells = $(rows[idx]).find(cellsel);
                    if (DEBUG) console.log("cells", cellsel, cells.length);
                       
                    let scripts = $(cells[0]).find("script");
                    if (scripts) $(scripts[0]).text("");

                    let ip = $(cells[0]).text();
                    let ip_port,type;

                    if (ip_port_regex.test(ip)) {
                        ip_port = ip;
                        type = $(cells[1]).text().trim().toLowerCase();

                    } else if (ip_regex.test(ip)) {
                        let port = $(cells[1]).text();
                        ip_port = `${ip}:${port}`;
                        type = $(cells[2]).text().trim().toLowerCase();
                    }
                    outp.types[type].push(ip_port);
                    outp.total++;
                }
                cb(null,outp);
            });
        }
    }

    module.exports = api;
}