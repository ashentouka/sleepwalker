{
    module.exports = function (source) {
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
    }
}