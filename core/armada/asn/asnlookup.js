{
    const datasource = require("./asnmap.json");

    function asndata(ip){
        let start_time = new Date();
        const ip4_regex = /([1-2]?[0-9]{1,2}[.]){3}([1-2]?[0-9]{1,2})/;
        if (ip4_regex.test(ip)){
            function ip_octs(input) {
                let oct_str = input.split(".");
                let oct_arr = [];
                for (let idx = 0; idx < 4; idx++) {
                    oct_arr.push(parseInt(oct_str[idx]));
                }
                return oct_arr;
            }
            let octets = ip_octs(ip);
            let tocheck = datasource[octets[0]];
            for (let idx in tocheck){
                let start = ip_octs(tocheck[idx].start_ip);
                let end = ip_octs(tocheck[idx].end_ip);

                function octcheck(oct) {
                    if (octets[oct] >= start[oct] && octets[oct] <= end[oct]) {
                        if (oct < 3) {
                            return octcheck(oct + 1)
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
                let result = octcheck(1);
                if (result) {
                    return tocheck[idx];
                }
            }
        }
    }
    module.exports = {
        asndata
    };
}