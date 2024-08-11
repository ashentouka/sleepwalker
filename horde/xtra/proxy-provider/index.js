{
	const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

    const VALID = /^(https?|socks[45]):\/\/\w+:\w+@([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}(:\d{2,5})?)$/;

	class ProxyProviderPlugin extends PuppeteerExtraPlugin {
	  constructor(opts = {}) {
	    super(opts)
	  }

	  get name() {
	    return 'proxy-provider'
	  }

	  async onPageCreated(page) {
	  	page.setProxy = proxy => {
	  		if (VALID.test(proxy)) {
		  		page.proxy = proxy;
		  		const pageProxy = require("./module");
        	    pageProxy(page, proxy);
        	}
	  	}
	  	page.getProxy = function(){
	  		return page.proxy;
	  	}
	  }
	}

	module.exports = function(pluginConfig) {
	  return new ProxyProviderPlugin(pluginConfig)
	}

}