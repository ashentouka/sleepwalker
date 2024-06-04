{
    
    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;  
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

    module.exports = function ({ $, source, __outp }) {
        let outp = __outp || { total: 0, types: {http:[],https:[],socks4:[],socks5:[]}};
        let vv = $(source.selector);

        if (vv) {
            for (let idx = source.skiprow ? 1 : 0; idx < vv.length; idx++){
                let cells = $(vv[idx]).find(source.cell || "td");
                if (cells && cells.length > 1) {
                    let ip = $(cells[0]).text().trim();
                    let ip_port,type;

                    if (ip_port_regex.test(ip)) {
                        type = cells[1].text().trim().toLowerCase();
                        ip_port = ip;

                    } else if (ip_regex.test(ip)) {
                        let port = $(cells[1]).text().trim();
                        ip_port = `${ip}:${port}`;
                        type = cells[2].text().trim().toLowerCase();
                    }
                    outp.types[type].push(ip_port);
                    outp.total++;
                }
            }
            return outp;
        }
    }
}