{
	const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

	class PlausibleRefererPlugin extends PuppeteerExtraPlugin {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  get name() {
	    return 'plausible-referer'
	  }

	  async onPageCreated(page) {
	  	const generator = require("./module");
	  	page.setExtraHTTPHeaders({ "Referer": generator() })
	  }
	}

	module.exports = function(pluginConfig) {
	  return new PlausibleRefererPlugin(pluginConfig)
	}

}