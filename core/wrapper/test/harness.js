{
    const fs = require("fs");
    const path = require("path");
	let test_mod = process.argv[2];
    let path_mod = (fs.existsSync(path.resolve(__dirname + `/../modules/fetch/${test_mod}.js`))) ? "fetch" : "puppeteer";
	const mod = require(`../modules/${path_mod}/${test_mod}.js`);

    if (mod.init){
        const { puppeteer } = require("@sleepwalker/horde");
        const scraper = puppeteer({
            block: { ads: true, trackers: true, resources: true },
            concurrency: "page",
            threads: 1
        })
        mod.init(scraper);
    }

	const all_protocols = ['http', 'https', 'socks4', 'socks5'];
    for (let pr of all_protocols) {
        function fp(proto){
            if (mod[proto]) {
            	const res = mod[proto]().then(data=>console.log(proto,data)).catch(console.trace);
            }
        }
        fp(pr);
    }

}