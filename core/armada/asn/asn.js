{
    const fs = require("fs");
    const axios = require("axios");
    function loadWeb() {
        axios.get("https://www.peeringdb.com/api/net", {headers: {"Authorization": "Api-Key 8y3k29ZG.dw6Uf3tRZTsCPlhAQ5vEsNGIR3RNDBmz"}}).then(res => {
            let data = res.data;

            fs.writeFileSync("./net.json", JSON.stringify(data, null, 2));
        })
    }
    const _asn_datamap = ()=> {
        const asn_net = require("./net.json").data;
        const asn_data_map = {};
        for (let idx in asn_net) {
            let adata = asn_net[idx];
            let asn = `AS${adata.asn}`;
            asn_data_map[asn] = {
                type: adata.info_type,
                residential: adata.info_type === "Cable/DSL/ISP",
                name: adata.name,
                asn: asn,
                web: adata.website
            };
        }
        fs.writeFileSync("./asnet.json", JSON.stringify(asn_data_map, null, 2));
    }

    const asn_data_map = require("./asnet.json");
    const asn_map = (()=> {
        const ip4_regex = /([1-2]?[0-9]{1,2}[.]){3}([1-2]?[0-9]{1,2})/;
        const asn_data = fs.readFileSync("./asn.json", "utf8").split("\n");
        let map = {};
        for (let adx in asn_data) {
            if (asn_data[adx].trim() !== "") {
                let data = JSON.parse(asn_data[adx]);
                if (ip4_regex.test(data.start_ip)) {
                    let asnkey = data.asn;
                    data.asn = asn_data_map[asnkey];
                    let start_first = data.start_ip.split(".")[0];
                    let end_last = data.end_ip.split(".")[0];
                    function _map_(_f){
                        if (!map[_f]) {
                            map[_f] = [data]
                        } else {
                            map[_f].push(data);
                        }
                    }
                    if (end_last > start_first) {
                        for (let ipx = parseInt(start_first); ipx <= parseInt(end_last); ipx++) {
                            _map_(ipx);
                        }
                    } else {
                        _map_(parseInt(start_first));
                    }
                }
            }
        }
        fs.writeFileSync("./asnmap.json", JSON.stringify(map, null, 2));
        return map;
    })();
}