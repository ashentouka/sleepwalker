{

    const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;
    const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;
    
    module.exports = function ({ source, __outp }) {
        let outp = __outp || { total: 0, types: {http:[],https:[],socks4:[],socks5:[]}};
        let vv = document.querySelectorAll(source.selector);

        if (vv) {
            let outp = [];
            let fc;
            for (let idx = 0; idx < vv.length; idx++) {
                let cells = vv[idx].querySelectorAll("td");
                if (cells && cells.length > 1) {
                    fc = cells.length;
                    let ip = cells[0].innerText.trim();
                    let ip_port,type;

                    if (ip_port_regex.test(ip)) {
                        ip_port = ip;
                        type = cells[1].innerText.trim();

                    } else if (ip_regex.test(ip)) {
                        let port = cells[1].innerText.trim();
                        ip_port = `${ip}:${port}`;
                        type = cells[2].innerText.trim();
                    }
                    outp.types[type].push(ip_port);
                    outp.total++;
                }
            }
            return outp;
        }
    }
}