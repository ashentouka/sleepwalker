{
	module.exports = {
		github(project) {
			return new Promise(resolve=>{
				const fs = require("fs"); let git;
				const gh = project.split("/"), $USER=0, $PROJECT=1;
				const datadir = require("@sleepwalker/router").data.path("github/"+gh[$USER]);
				const projdir = `${datadir}/${gh[$PROJECT]}`;
				const url = `https://github.com/${project}.git`;
				const { spawn } = require("node:child_process"); 
	          	if (!fs.existsSync(projdir)){
	          		git = spawn("git",["clone", "-v", url], { cwd: datadir });
	          	} else {
	          		git = spawn("git",["pull", "-v"], { cwd: projdir });
	          	}
	      		git.stdout.on('data', (data) => {
	      			console.log("[stdout]", `${data}`);
	      		});
	      		git.stderr.on('data', (data) => {
	      			console.log("[stderr]", `${data}`);
	      		});
	      		git.on("close", function(){ resolve(); })
      		})
		} 
	};


/*	(async function() {
		await module.exports.github("casals-ar/proxy-list");
		await module.exports.github("im-razvan/proxy_list");
		await module.exports.github("vakhov/fresh-proxy-list");
		await module.exports.github("themiralay/Proxy-List-World");
		await module.exports.github("elliottophellia/yakumo");
	})();*/
}