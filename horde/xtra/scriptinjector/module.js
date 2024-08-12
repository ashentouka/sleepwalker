{

	const filters = [
		{ expr: /\sdebugger;?\s/g, repl: "" },
		{ expr: /(attachShadow\s*\(\s*\{\s*mode:\s*)(['"`])closed['"`]/g, repl: "$1$2open$2" },
		{ expr: /(shadowrootmode\s*=\s*)(["'])open['"]/g, repl: "$1$2open$2" }
	];
	const selector = 'template[shadowrootmode="closed"]';
	let payloads=[],  cheerio = require("cheerio");

    async function init() {
    	page.injectScript = function(js,matches){
    		let fmat = (matches instanceof RegExp) ? url=>matches.test(url) : url=>{ return matches === "*"|| url.includes(matches)};
    		payloads.push({js,fmat});
    	}
    	/*
    	await page.setRequestInterception(true);
	  	await page.on("request", request=>{
	  		let url = new URL(request.url());
	  		if (/https?/.test(url.protocol)){
	  			//console.log(url);
		  		//if (this.opts.debug) console.log(request);
	 			if (!request.isInterceptResolutionHandled()) request.continue();
	 		}
	  	})
	  	*/

	  	await page.on("response", response=>{
	  		const request = response.request();
	  		const headers = response.headers();

	  		const url = new URL(request.url());
	  		const okay = response.ok();
	  		const nav = request.isNavigationRequest();
	  		const status = response.status();
	  		const type = headers["content-type"];
	  		if (okay && nav && type === "text/html"){
	  			console.log("response, nav:", nav, headers["content-type"], status);
	  			for (let {js,fmat} of payloads){
			  		let html = response.text();
			  		let $=cheerio.load(html);

			  		if (fmat(url.origin+url.pathname)){
			  			let injscr = document.createElement("script")
			  			injscr.type="text/javascript";
			  			injscr.disposition="dopest motherfucker right now";
			  			injscr.innerText=js;

			  			$("body").append(injscr);
			  		}
			  		$("script").forEach(script=>{
			  			let code = script.innerText;
			  			if (code && !script.attr("src")){
			  				for ({ expr, repl } of filters){
			  					code = code.replaceAll(expr,repl);
			  				}
			  			}
			  			script.innerText = code;
			  		});

			  		$(selector).forEach(template=>{
			  			template.shadowrootmode="open";
			  		})
			  	}
		  		request.respond()
		  	}
 	  	})
//	  }
    }

    let page;
    let debug = false;

	module.exports = {
		async init(pp, dbg){
			if (pp) {
				page = pp;
			}
			if (dbg === true) {
				debug = true;
			}
			await init();
		}
	}

}