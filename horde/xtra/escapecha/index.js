{
	const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

	class EscapeChaPlugin extends PuppeteerExtraPlugin {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  get name() {
	    return 'escapecha'
	  }

	  async onPageCreated(page) {
	  	await require("./utils/util").init(page, this.opts.debug, this.opts.fingerprint);
	  	await require("./solvers/turnstile").init(page, this.opts.debug);
	  	await require("./solvers/recaptcha").init(page, this.opts.debug);
	  }
	}

	module.exports = function(pluginConfig) {
	  return new EscapeChaPlugin(pluginConfig)
	}

}