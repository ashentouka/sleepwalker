{
    (async()=>{
        const data = require("./datasourcery");
        await data.export();
        await data.getProxy({}).then(proxies=>console.log(proxies.length));
    })()
}