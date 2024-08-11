{
	const { v7: uuidv7 } = require("uuid"), fs = require("fs"), os = require("os"), path = require("path");
	const { spawn } = require("node:child_process");
	const tmpdir = path.join(os.tmpdir(), path.sep + "escapecha" + path.sep);

	async function spawnRecognizer(img){
		return new Promise((resolve,reject)=>{
			const py = spawn("python", [ path.join(__dirname + "/cloudflare.py"), path.join(__dirname + "/cloudflare-check-light.png"), img ]);
			py.stdout.on('data', (data) => {
				resolve(data ? `${data}`: null);
			});

			py.stderr.on('data', (data) => {
			    console.log("STDERR", `${data}`);
			});

			py.on('close', (code) => {
				if (code !== 0) reject("script exited with error.code: "+code);
			});
		})
	}

	async function detect() {
		return new Promise(async resolve=>{
			//setTimeout(async function(){
				const detected = await page.evaluate(function(){
					return (document.getElementById("footer-text")?.innerText === 'Performance & security by Cloudflare');
				});
				if (debug) console.log("Cloudflare turnstyle:", detected);
				resolve(detected);
			//}, delay)
		});
	}

	async function goto(url) {
		console.log("call to goto", url);
		return new Promise(async (resolve,reject)=>{
			try {
				page.setDefaultTimeout(60000);
				await page_goto_origin.call(page, url, { timeout: 60000, waitFor: "networkidle0" });
				
				if (debug) console.log("checking for Cloudflare turnstyle.");
				let detected = await detect();
				if (detected) {
					const uuid = uuidv7();
					const interval = setInterval(async function(){
						await page.mouse.move(page.getRandom(1920), page.getRandom(1080), { steps: page.getRandom(5)});
						const screenshot = path.join(tmpdir, `${uuid}.png`);
						await page.screenshot({ path:  screenshot, fullPage: false });
						console.log(screenshot);

						const target = await spawnRecognizer(screenshot);
						console.log(target);

						if (target){
							const pixels = JSON.parse(target);
							await page.mouse.click(pixels[0], pixels[1]);
							await page.mouse.move(page.getRandom(1920), page.getRandom(1080), { steps: page.getRandom(5)});
							if (debug) console.log("clicked the turnstyle", pixels[0], pixels[1]);
							clearInterval(interval);

							let intv2 = setInterval(async function(){
								detected = await detect()
								if (!detected) {
									clearInterval(intv2);
									resolve();	
								} else {
									await page.screenshot({ path:  screenshot, fullPage: false });
								}
							},500);
						}

			/*			let container = await page.evaluateHandle(function(){
							return document.querySelector("body > div.main-wrapper > div > div:nth-child(3) > div > div > div").shadowRoot.querySelector("iframe[title='Widget containing a Cloudflare security challenge']")
						});
						console.log(container);*/
			/*			let checkbox = await container.$("input [type='checkbox']");
						let fail = await page.isVisible(container.$("#fail"));
						let success = await page.isVisible(container.$("#success"));
						let verifying = await page.isVisible(container.$("#verifying"));
						console.log(verifying,checkbox,success,fail);*/
			/*			let id = await page.evaluate(function() {
							return document.querySelector('body > div.main-wrapper > div > div:nth-child(3)').id;
						});
						let checkbox = await page.$('body > div.main-wrapper >>> input[type="checkbox"]');*/
			/*			let fail = await page.$(">>>> #fail");
						let success = await page.$(">>>> #success");
						let verifying = await page.$(">>>> #verifying");*/
			//			console.log(id,checkbox);
					},10000);
				} else {
					resolve();
				}
			} catch (ex) {
				reject(ex);
			}
		})
	}

	async function init() {
		page_goto_origin = page.goto;
		page.goto = goto;
		if (debug) console.log("rebound goto to detect Cloudflare turnstyle");
	}

	let page;
	let debug = false;
	let page_goto_origin;

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