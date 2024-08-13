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
	let user_conf = (fs.existsSync(data_dir+"konf.json5")) ? require(data_dir+"konf.json5"): {};

	const konf = Object.assign(def_conf,user_conf);
	fs.writeFileSync(data_dir+"konf.json5",JSON5.stringify(konf,null,2));
	
	module.exports = {
		module(group){
			return konf[group] || konf;
		},
		path(sub=""){
			let o = data_dir+sub;
			if (!fs.existsSync(o)){
				fs.mkdirSync(o, { recursive: true });
			}
		}
	}
}