{
	const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

	class ViewportPlugin extends PuppeteerExtraPlugin {
	  constructor(opts = {}) {
	    super(opts)
	  }

	  get name() {
	    return 'viewport'
	  }

	  get defaults() {
	  	return {
	  		mobile: false,
	  		debug: false
	  	}
	  }

	  async onPageCreated(page) {
	  	let viewport = {
	        width: (this.opts.mobile ? 1080 : 1920),// - Math.floor(Math.random() * 200),
	        height: (this.opts.mobile ? 1920 : 1080),// - Math.floor(Math.random() * 200),
	  	};
	  	if (this.opts.mobile){
		  	const userAgent = require("user-agent-stealth");
		  	const header = userAgent.mobile();
		  	await page.setUserAgent(header);
		  	if (this.opts.debug) console.log("User-Agent", header);
		
	    	viewport = Object.assign(viewport, {
		        deviceScaleFactor: 1,
		        hasTouch: this.opts.mobile,
		        isLandscape: false,
		        isMobile: this.opts.mobile,
		    });
	    }
	    if (this.opts.debug) console.log("viewport", viewport);
	    await page.setViewport(viewport);
	  }
	}

	module.exports = function(pluginConfig) {
	  return new ViewportPlugin(pluginConfig)
	}

}