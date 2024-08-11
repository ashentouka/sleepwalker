{
	const { Wit } = require("node-wit"), wit = new Wit({accessToken:"DQ7RX7EQZDEEDV75WOI4AN7KZ4ARC2CR"});

	const { v7: uuidv7 } = require("uuid"), fs = require("fs"), os = require("os"), path = require("path");
	const tmpdir = path.join(os.tmpdir(), path.sep + "escapecha" + path.sep);

	const RECAPTCHA_HINT = ".rc-imageselect-desc-no-canonical strong";
	const RECAPTCHA_STATUS = "#recaptcha-accessible-status";
	const RECAPTCHA_CHECKBOX = ".recaptcha-checkbox";
	const RECAPTCHA_CHALLENGE = "#rc-imageselect";

    const AUDIO_BUTTON = "#recaptcha-audio-button";
    const AUDIO_SOURCE = "#audio-source";
    const AUDIO_ERROR_MESSAGE = ".rc-audiochallenge-error-message";
    const AUDIO_RESPONSE = "#audio-response";

    const RELOAD_BUTTON = "#recaptcha-reload-button";
    const VERIFY_BUTTON = "#recaptcha-verify-button";
    const DOSCAPTCHA = ".rc-doscaptcha-body";

    const IFRAME_RECAPTCHA = 'iframe[title="reCAPTCHA"]';
    const IFRAME_CHALLENGE = 'iframe[title="recaptcha challenge expires in two minutes"]';

    const { simple } = require("../../../source/index");

	let page;
	let iframe;
	let iframe2;
	let debug = false;

	function timeoutPromise(ms){
		return new Promise(resolve=>{
			setTimeout(resolve,ms);
		})
	} 

	async function recaptchaSTATUS(){
		return await iframe.evaluate(async (RECAPTCHA_STATUS) => {
		    return document.querySelector(RECAPTCHA_STATUS)?.innerText;
		}, RECAPTCHA_STATUS)
	}

	async function recaptchaDOS(){
		return await iframe2.evaluate(async (DOSCAPTCHA) => {
		    return document.querySelector(DOSCAPTCHA)?.innerText?.length > 0;
		}, DOSCAPTCHA)
	}

	async function recaptchaAudioSource(){
		return new Promise(resolve=>{
			let interval = setInterval(async function(){
				const dos = await recaptchaDOS();
				if (dos){
					clearInterval(interval);
					if (debug) console.log("Automated Queries Detected");
					resolve({ error: "Automated Queries Detected" });
				} else {
					const mp3url = await iframe2.evaluate(function(){
						return document.querySelector("#audio-source")?.src;
					})
					if (mp3url && mp3url !== page.r3c4st4t3.audio) {
						page.r3c4st4t3.audio = mp3url;
						clearInterval(interval);
						resolve({ mp3url });
					}
				}
			},100)
		})
	}

	async function recaptchaAudioError(){
		return await iframe2.evaluate(async (AUDIO_ERROR_MESSAGE) => {
		    return document.querySelector(AUDIO_ERROR_MESSAGE)?.innerText?.length > 0;
		}, AUDIO_ERROR_MESSAGE);
	}

	async function recaptchaSubmissionState(main){
		return new Promise(resolve=>{
			let interval = setInterval(async function(){

				let statusNow = await recaptchaSTATUS();
				const error = await recaptchaAudioError();
				const dos = await recaptchaDOS();

				if (debug) console.log("recaptchaSubmissionState", statusNow, error, dos);

				if (error) {
					clearInterval(interval)
					page.r3c4st4t3.clicked= false;
					await iframe2.click(RELOAD_BUTTON);
					resolve(page.solveRecaptcha)

				} else if (dos) {
					clearInterval(interval);
					page.r3c4st4t3.error = "Automated Queries Detected";
					resolve(function() {
						main(page.r3c4st4t3);
					});
				} else if (page.r3c4st4t3.ini !== statusNow) {
					clearInterval(interval);
					page.r3c4st4t3.solved = true;
					resolve(function() {
						main(page.r3c4st4t3);
					});
				}
			},100)
		})
	}

	async function isVisible(selector, parent) {
		let bool = await (parent ?? page).evaluate(function isVis(selector) {
	        let el = document.querySelector(selector);
	        return (el !== null && el.offsetParent !== null);
	    }, selector);

		return bool;
	}

	async function postClick(){
		return new Promise(resolve=>{
			const delay = Math.round(Math.random()*5000);
			setTimeout(async function(){
				const iframeHandle2 = await page.waitForSelector(IFRAME_CHALLENGE);
				iframe2 = await iframeHandle2.contentFrame();

				let interval = setInterval(async function(){
					let statusNow = await recaptchaSTATUS();
					if (debug) console.log("solveRecaptcha status", statusNow);
					if (page.r3c4st4t3.ini !== statusNow) {
						page.r3c4st4t3.solved = true;
						if (debug) console.log("solveRecaptcha solved", page.r3c4st4t3.solved);
						clearInterval(interval);
						resolve(true);

					} else {
						let vis2 = await isVisible(RECAPTCHA_CHALLENGE, iframe2);
						let vis3 = await isVisible(AUDIO_BUTTON, iframe2);
						if (vis2 && vis3) {
							clearInterval(interval);
							resolve(false);
						}
					}
				},100);
			}, delay);
		})
	}

	async function init(){
		if (debug) console.log("Escapecha: audio bound to puppeteer page.");
		if (!fs.existsSync(tmpdir)) fs.mkdirSync(tmpdir);

		page.r3c4st4t3 = {
 			ini: null,
 			solved: false,
		    clicked: false,
		    audio: null
		}

		page.solveRecaptcha = async function() {
			if (debug) console.log("solveRecaptcha start");
			return new Promise(async resolve=>{

				try {
					const iframeHandle = await page.waitForSelector(IFRAME_RECAPTCHA);
					iframe = await iframeHandle.contentFrame();

					page.r3c4st4t3.ini = await recaptchaSTATUS();
					if (debug) console.log("solveRecaptcha status", page.r3c4st4t3.ini);
					let vis = await isVisible(RECAPTCHA_CHECKBOX,iframe);
					if (!page.r3c4st4t3.clicked && vis){

						if (debug) console.log("solveRecaptcha time to click()");
						await iframe.click(RECAPTCHA_CHECKBOX);
						page.r3c4st4t3.clicked = true;
						if (debug) console.log("solveRecaptcha clicked", page.r3c4st4t3.clicked);

						let resultPromise = await postClick();
						let result = await resultPromise;

						if (!result) {
							await iframe2.click(AUDIO_BUTTON);
							if (debug) console.log("solveRecaptcha audio clicked");

							const audioPromise = await recaptchaAudioSource();
							const { mp3url, error } = await audioPromise;
							
							if (error) {
								page.r3c4st4t3.error = error;
								resolve(page.r3c4st4t3);
							} else {
								let proxy;

								if (page.getProxy) {
									proxy = page.getProxy();
									if (proxy && debug) console.log("solveRecaptcha proxy", proxy);
								}

								if (debug) console.log("solveRecaptcha audio", mp3url);
								const filename = path.join(tmpdir, `${uuidv7()}.mp3`);
								const options = { url: mp3url, accept: "file", filename, proxy };
								if (debug) console.log("solveRecaptcha audio get options:", options);
								await simple(options);

								if (debug) console.log("solveRecaptcha audio downloaded");
								const response = await wit.dictation('audio/mpeg', fs.ReadStream(filename));

								if (debug) console.log("solveRecaptcha wit.dictation", response.text);

								await iframe2.type(AUDIO_RESPONSE, response.text);
								await iframe2.click(VERIFY_BUTTON);
								
								const nextStepPromise = await recaptchaSubmissionState(resolve);
								const nextStep = await nextStepPromise;
								await nextStep();
							}
						} else {
							resolve(page.r3c4st4t3);
						}
					}
				} catch (ex) {
					if (debug) console.log(ex);
					page.r3c4st4t3.error = ex.message;
					resolve(page.r3c4st4t3);
				}
			})
		}
	}

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