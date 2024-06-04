{
    const client = require("./client-simple");

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/

    module.exports = {
        rest (path, source, cb) {
            client.paged(path, null, cb);
        },

        plaintext (path, source, cb) {
            client.client(path, null, (e,d)=>{
                cb(e,d?d.data:null)
            });
        },

        table (path, source, cb) {
            function _int_cb_ (e,d) {
                if (!e && d.type === "html"){
                    let $ = d.data;
                    let rows = $(source.selector);

                    let outp = [];
                    for (let idx = 0; idx < rows.length; idx++){
                        let cells = $(rows[idx]).find("td");
                        let ip = $(cells[source["cell-ip"] || 0]).html();
                        if (ip_regex.test(ip)) {
                            let port = $(cells[source["cell-port"] || 1]).html();
                            outp.push(`${ip}:${port}`);
                        }
                    }
                    cb(null,outp);
                } else {
                    cb(e)
                }
            }
            if (source.post){
                client.post(path, null, source.post, _int_cb_);
            } else {
                client.client(path, null, _int_cb_);
            }
        }
    }
}
