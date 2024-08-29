{	

	const path = require("path");
	const fs = require("fs");

	const pack = JSON.stringify({
	  "name": "@sleepwalker/router",
	  "version": "1.0.0",
	  "main": "generated.js",
	  "license": "MIT"
	});

	function remap(install){
return `module.exports = {
	dir: "${install}",
	disarray: require("${install}/core/disarray"),
	konsole: require("${install}/core/konsole"),
	data: require("${install}/core/data"),
	horde: require("${install}/horde")
};`
/* ,
	armada: require("${install}/core/armada"),
	wrapper: require("${install}/core/wrapper"),
	service: require("${install}/core/service") */
	}

	if (require.main === module) {
		const install = path.resolve(__dirname);
		const data = remap(install);
		if (!fs.existsSync(path.resolve(__dirname+"/router/"))) fs.mkdirSync(path.resolve(__dirname+"/router/"));
		fs.writeFileSync(path.resolve(__dirname+"/router/generated.js"), data);
		fs.writeFileSync(path.resolve(__dirname+"/router/package.json"), pack);
	}

}