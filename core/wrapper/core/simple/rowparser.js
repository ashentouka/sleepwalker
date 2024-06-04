{
    
    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;  
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

    module.exports = function ({ $, source, __outp }) {
        let outp = [];
        let vv = $(source.selector);

        if (vv) {
            for (let idx = source.skiprow ? 1 : 0; idx < vv.length; idx++){
                let cells = $(vv[idx]).find(source.cell || "td");
                if (cells && cells.length > 1) {
                    let ip = $(cells[0]).text().trim();
                    let ip_port;

                    if (ip_port_regex.test(ip)) {
                        outp.push(ip);

                    } else if (ip_regex.test(ip)) {
                        outp.push(`${ip}:${$(cells[1]).text().trim()}`);
                    }
                }
            }
            return outp;
        }
    }
}