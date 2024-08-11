{

    async function handleNewPage({ page, config = {} }) {
        const { protectPage } = require('puppeteer-afp');
        protectPage(page, {
            webRTCProtect: false,
            ...config
        });
        return page
    }

	module.exports = {
		init(page, debug, fingerprint){
			page.isVisible = async function (selector, context=page) {
				let bool = await context.evaluate(function (selector) {
			        let el = (typeof selector === "string") ? document.querySelector(selector) : selector;
			        return (el !== null && el.offsetParent !== null);
			    }, selector);
				if (debug) console.log("isVisible", selector, bool);
				return bool;
			};
			if (debug) console.log("bound isVisible to page");

			page.waitForVisible = async function (selector, context=page, timeout=10000) {
				return new Promise(resolve=>{
					let time = 0;
					let interval = setInterval(async () => {
						const bool = await page.isVisible(selector, context);
						if (bool) {
							clearInterval(interval);
							resolve(context.$(selector));
						} else {
							time+=250;
							if (time >= timeout) {
								clearInterval(interval);
								resolve();
							}
						}
					},250);
				})
			};
			if (debug) console.log("bound waitForVisible to page");

			page.getRandom=function (min, max) {
				if (!max) {
					max = min;
					return Math.floor(Math.random() * Math.floor(max));
				} else {
					return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
				}
			}
			if (debug) console.log("bound getRandom to page");

			page.waitForTimeout = async function (ms) {
			    return new Promise(resolve => {
			    	if (debug) console.log("waitForTimeout", ms);

			        setTimeout(() => {
			            resolve()
			        }, ms);
			    })
			}
			if (debug) console.log("bound waitForTimeout to page");

            if (fingerprint === true) {
                handleNewPage({ page: page, config: fpconfig });
            	if (debug) console.log("fingerprinting via puppeteer-afp enabled.");
            }
		}
	}
}