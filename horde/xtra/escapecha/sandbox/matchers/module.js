{

	const { v7: uuidv7 } = require("uuid"), fs = require("fs"), os = require("os"), path = require("path");
	const { spawn } = require("node:child_process");
	const tmpdir = path.join(os.tmpdir(), path.sep + "escapecha" + path.sep);
	
	const RECAPTCHA_HINT = ".rc-imageselect-desc-no-canonical strong";
	const RECAPTCHA_STATUS = "#recaptcha-accessible-status";
	const RECAPTCHA_CHECKBOX = ".recaptcha-checkbox";
	const RECAPTCHA_CHALLENGE = ".rc-imageselect";

	function initRecaptcha() {
		constsheet = document.head.appendChild(document.createElement('style')).sheet;

		sheet.insertRule('.rc-imageselect-table-33, .rc-imageselect-table-42, .rc-imageselect-table-44 { transition-duration: 0.25s !important }', 0);
	  	sheet.insertRule('.rc-imageselect-tile{ transition-duration: 0.75s !important }', 1);
	  	sheet.insertRule('.rc-imageselect-dynamic-selected { transition-duration: 0.5s !important }', 2);
	  	sheet.insertRule('.rc-imageselect-progress { transition-duration: 0.25s !important }', 3);
	  	sheet.insertRule('.rc-image-tile-overlay { transition-duration: 0.25s !important }', 4);
	}

	function timeoutPromise(ms){
		return new Promise(resolve=>{
			setTimeout(resolve,ms);
		})
	} 

	async function spawnRecognizer(img, hint){
		return new Promise((resolve,reject)=>{
			const py = spawn("python", [ "matcher.py", img, hint ]);
			py.stdout.on('data', (data) => {
				resolve(data);
			});

			py.stderr.on('data', (data) => {
			  // noop
			});

			py.on('close', (code) => {
				if (code !== 0) reject("script exited with error.code: "+code);
			});
		})
	}

	async function checkRecaptcha(){
		await page.locator(RECAPTCHA_CHECKBOX).click();
	}

	async function solveRecaptcha(){
		if (! await validRecaptcha()) await checkRecaptcha();
		await (await page.evaluate(timeoutPromise, 3000));
		
		while (! await validRecaptcha() && await waitingRecaptcha()) {
			const screenshot = path.join(tmpdir, `${uuidv7()}.png`);
			const hint = await hintRecaptcha();
			await page.screenshot({ path:  screenshot, fullPage: false });

			const targets = await spawnRecognizer(screenshot, hint);
	}

	async function statusRecaptcha(){
		return await page.evaluate(async () => {
		    return document.getElementById(RECAPTCHA_STATUS).textContent;
		})
	}

	async function hintRecaptcha(){
		return await page.evaluate(async () => {
		    return document.querySelector(RECAPTCHA_HINT).textContent;
		})
	}

	async function waitingRecaptcha(){
		return await page.evaluate(async () => {
		    return document.querySelector(RECAPTCHA_CHALLENGE)?.style?.display === "block";
		})
	}

	async function validRecaptcha(){
		let now_status = await statusRecaptcha();
		return now_status != ini_status;
	}

	let page;
	let ini_status;

	module.exports = {
		async init( page: pp ){
			page = pp;
			await page.evaluate(initRecaptcha);
			if (!fs.existsSync(tmpdir)) fs.mkdirSync(tmpdir);
			ini_status = await statusRecaptcha();
			page.solveRecaptcha = solveRecaptcha;
		}
	}
}