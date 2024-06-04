{
    const DEBUG = false;

    const client = require("@sleepwalker/client-simple");

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

    const api = {
/*        rest (path, source, cb) {
            client.paged(path, null, cb);
        },*/

        plaintext (path, source, cb) {

            if (DEBUG) console.log(`client [simple] method [plaintext] url [${path}]`);
            client.client(path).then(d=>{
                cb(null, d.data)
            });
        },
 
        paged (path, source, cb) {

            let proxy_data = [];
            function _prox(pg) {
                const pageout = (source.namedpages) ? source.namedpages[pg - 1] : pg;
                api.table(path + pageout, source, (e, d) => {
                    if (e) {
                        if (DEBUG) console.log(e.message);
                        cb(e)

                    } else if (d.length > 0) {
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

            console.log(`client [simple] method [table] url [${path}]`);
            function _int_cb_ (d) {
                let $ = d.data;
                let rows = $(source.selector);
                if (DEBUG) console.log("rows",rows.length);
                let outp = [];
                for (let idx = source.skiprow ? 1 : 0; idx < rows.length; idx++){
                    let cellsel = source.cell || "td";
                    let cells = $(rows[idx]).find(cellsel);
                    if (DEBUG) console.log("cells", cellsel, cells.length);
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
            }
            client.client(path).then(_int_cb_);

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
            function _int_cb_ (d) {
                let $ = d.data;
                let rows = $(source.selector);
                if (DEBUG) console.log("rows",rows.length);
                for (let idx = source.skiprow ? 1 : 0; idx < rows.length; idx++){
                    let cellsel = source.cell || "td";
                    let cells = $(rows[idx]).find(cellsel);
                    if (DEBUG) console.log("cells", cellsel, cells.length);
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
            }
            client.client(path).then(_int_cb_);

        }
    }

    module.exports = api
}
