{
    const { ArrayDataSync } = require("./datasource")
    const DisArray = require("disarray");
    function collect(name) {
        let output = new DisArray();
        const socks4 = new ArrayDataSync(`data/${name}/socks4`, []);
        const socks5 = new ArrayDataSync(`data/${name}/socks5`, []);
        const http = new ArrayDataSync(`data/${name}/http`, []);
        return output.concat(socks4, socks5, http);
    }

    let working = collect("working");
    let blacklist = collect("blacklist");
    let armada = collect("export");

    module.exports = {
        working,
        blacklist,
        armada
    }

}