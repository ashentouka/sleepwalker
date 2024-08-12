{
	const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

	class ScriptInjectorPlugin extends PuppeteerExtraPlugin {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  get name() {
	    return 'script-injector'
	  }

	  async onPageCreated(page) {
	  	require("./module").init(page, this.opts.debug);
	  }
}
	module.exports = function(pluginConfig) {
	  return new ScriptInjectorPlugin(pluginConfig)
	}

}