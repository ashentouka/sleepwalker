{    

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;  
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;
    
    const DEBUG = false;

    function init() { // (client) {
        const cheerio = require("cheerio");

/*        const hybrid = (url) => {
            return new Promise(resolve=>{
                client.execute(async ({ page }) => {
                    //const { searchTerm, offset } = data;
                     console.log("hybrid", url);
                    await page.goto(url);
                     console.log("hybrid, goto", url);
                    let source = await page.content({"waitUntil": "domcontentloaded"});
                     console.log("hybrid, source", source.length);
                    await page.close();
                    console.log("hybrid, page close");
                    resolve(cheerio.load(html));
                });
            })
        }*/

        const table = async ($, source) => {
            if (DEBUG) console.log(`client [hybrid] method [table] url [${path}]`);
    //        client().hybrid(path).then($=>{
    //        const $ = await hybrid(path);
    //        console.log("$", $);

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
           // cb(null,outp);
       // });
            return outp;
        }

        const typetable = async ($, source,__outp) => {

            if (DEBUG) console.log(`client [simple] method [typetable] url [${path}]`);
            let outp = __outp || { total: 0, types: {http:[],https:[],socks4:[],socks5:[]}};
            
         //   client().hybrid(path).then($=>{
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
           // cb(null,outp);
       // });
            return outp;
        }

        return {
            table,
            typetable
        }
    }

    module.exports = init();
}