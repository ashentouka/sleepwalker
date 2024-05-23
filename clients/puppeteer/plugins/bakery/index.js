


function (data){
async ()=>{
    await page.setCookie(data.cookies);
})()
}


// hello-world-plugin.js
const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
    if (opt.data)
  }

  get name() {
    return 'Bakery Plugin'
  }

  async onPageCreated(page) {
    this.debug('page created', page.url())
    const ua = await page.browser().userAgent()
    this.debug('user agent', ua)
  }
}

module.exports = function (pluginConfig) {
  return new Plugin(pluginConfig)
}