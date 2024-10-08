{

            
    module.exports = {
        rowparser (source) {

            const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;
            const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;

            let vv = document.querySelectorAll(source.selector);

            if (vv) {
                let outp = [];
                let fc;
                for (let idx = 0; idx < vv.length; idx++) {
                    let cells = vv[idx].querySelectorAll("td");
                    if (cells && cells.length > 1) {
                        fc = cells.length;
                        let ip = cells[0].innerText;
                        if (ip_port_regex.test(ip)) {
                            outp.push(ip);
                        } else if (ip_regex.test(ip)) {
                            let port = cells[1].innerText;
                            let ip_port = `${ip}:${port}`;
                            outp.push(ip_port);
                        }
                    }
                }
                return outp;
            }
        },

        typesparser ({ source, __outp }) {

            const ip_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2})/;
            const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,6})/;
            
            let outp = __outp || { total: 0, types: {http:[],https:[],socks4:[],socks5:[]}};
            let vv = document.querySelectorAll(source.selector);

            if (vv) {
                for (let idx = 0; idx < vv.length; idx++) {
                    let cells = vv[idx].querySelectorAll("td");
                    if (cells && cells.length > 1) {
                        let ip = cells[0].innerText.trim();
                        let ip_port,type;

                        if (ip_port_regex.test(ip)) {
                            ip_port = ip;
                            type = cells[1].innerText.trim().toLowerCase();

                        } else if (ip_regex.test(ip)) {
                            let port = cells[1].innerText.trim();
                            ip_port = `${ip}:${port}`;
                            type = cells[2].innerText.trim().toLowerCase();
                        }
                        outp.types[type].push(ip_port);
                        outp.total++;
                    }
                }
                return outp;
            }
        }
    }
}