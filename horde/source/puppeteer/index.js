{
    function init ({ threads, concurrency, block, mobile = false, referer, fingerprint, extension, debug }) {
        const catcher = require("../util/catcher")(debug);
        const puppeteer = require('puppeteer-extra').addExtra(require('puppeteer'));
        const { Cluster } = require('puppeteer-cluster');
        const Xvfb =  require('xvfb');
        const path = require("path");
        const os = require("os");

        threads = threads || 10;

        const concurrency_mode = (()=>{
            switch (concurrency) {
            case "page":
                return Cluster.CONCURRENCY_PAGE        
            case "browser":
                return Cluster.CONCURRENCY_BROWSER
            default:
                return Cluster.CONCURRENCY_CONTEXT
            }
        })();

        puppeteer.use(require("../../xtra/viewport")({ debug, mobile }));
        //puppeteer.use(require('puppeteer-extra-plugin-stealth')());
        puppeteer.use(require("../../xtra/proxy-provider")());
        puppeteer.use(require("../../xtra/escapecha")({ debug, fingerprint }));

        if (referer){
            puppeteer.use(require("../../xtra/referer")());
        }

        if (block?.ads){
            const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
            puppeteer.use(AdblockerPlugin({ blockTrackers: block.trackers }))
        }

        if (block?.resources || block?.types){
            puppeteer.use(require('puppeteer-extra-plugin-block-resources')({
                blockedTypes: new Set(block.types ?? ['image', 'stylesheet', 'font', 'media', 'other'])
            }));
        }

        let xvfbsession;

        if (os.platform() === 'linux') {
            try {
                xvfbsession = new Xvfb({
                    silent: true,
                    xvfb_args: ['-screen', '0', '1920x1080x24', '-ac']
                });
                xvfbsession.startSync();
                if (debug) console.log("xvfb session started.");
            } catch (err) {
                console.log(err);
                throw new Error('xvfb failed is it installed?');
            }
        }

        function closeSession() {
            if (xvfbsession) {
                try {
                    xvfbsession.stopSync();
                } catch (err) { }
            }

            return true
        }
        
        let EXTENSION_PATH = path.join(__dirname + "/extension");

        let args=[ 
            "--no-sandbox",
            '--disable-setuid-sandbox', 
            '--disable-blink-features=AutomationControlled', 
            '--window-size=1920,1080'];
        if (extension){
            EXTENSION_PATH = extension;
        }
        args.push(`--disable-extensions-except=${EXTENSION_PATH}`)
        args.push(`--load-extension=${EXTENSION_PATH}`)
        

        if (debug) console.log(args);

        const clusterPromise = Cluster.launch({
            concurrency: concurrency_mode,
            maxConcurrency: threads,
            puppeteerOptions: {
                headless: false,
                args
            },
            puppeteer
        });

        return {
            async task(f){
                let cluster = await clusterPromise;
                return cluster.task(f);
            },
            async queue(data,f){
                let cluster= await clusterPromise;
                return cluster.queue(data,f);
            },
            async execute(data,f){
                let cluster= await clusterPromise;
                return cluster.execute(data,f);
            },
            async idle(){
                let cluster= await clusterPromise;
                return cluster.idle();
            },
            async close(){
                let cluster= await clusterPromise;
                closeSession();
                return cluster.close();
            }
        };
    }

    module.exports = init;
}