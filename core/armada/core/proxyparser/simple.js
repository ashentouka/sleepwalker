{
    const client = require("@sleepwalker/client-simple");

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/

    module.exports = {
        // rest (path, source, cb) {
        //     client.paged(path, {});
        // },

        plaintext (path, source, cb) {
            let opts = source.post ? { data: source.post } : {};
            client.client(path, opts).then(d=>cb(null,d.data)).catch(cb);
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
                client.post(path, {data:source.post}).then(d=>_int_cb_(null,d)).catch(_int_cb_);
            } else {
                client.client(path, {}).then(d=>_int_cb_(null,d)).catch(_int_cb_);
            }
        }
    }
}
