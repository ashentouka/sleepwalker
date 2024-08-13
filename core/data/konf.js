{
	const path = require("path");
	const fs = require("fs");
	const os = require("os");
	const JSON5 = require('json5')

	require("require-json5");
	const data_dir = os.homedir()+"/.sleepwalker/";
	const def_conf = require(__dirname+"/konf.json5");
	if (!fs.existsSync(data_dir)){
		fs.mkdirSync(data_dir);
	}
	if (!fs.existsSync(data_dir+"konf.json5")){
		fs.writeFileSync(data_dir+"konf.json5",JSON5.stringify(def_conf,null,2));
	}

	const user_conf = require(data_dir+"konf.json5");
	const konf = Object.assign(user_conf,def_conf);

	module.exports = function(group){
		return konf[group];
	}
}