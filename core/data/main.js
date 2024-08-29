{
    const { konf, path } = require("./konf");
    
    module.exports = {
        konf, path,
        datasourcery: require("./datasourcery"),

        async exporter(){
            const data = require("./datasourcery");
            await data.export();
            await data.getProxy({}).then(proxies=>console.log(proxies.length));
        }
    }
}