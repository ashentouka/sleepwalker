{
    require("../util/sys");
    async function client ({ block, mobile = false, referer, fingerprint, userdata, extension, debug }) {
        let browser, page;
        return new Promise(resolve=>{
            const {puppeteer,args} = abstract({ block, mobile, referer, fingerprint, userdata, extension, debug });
            puppeteer.launch({ headless: true }).then(async b => {
                browser = b;
                const page = await browser.newPage();
                resolve(page);
            })
        }).finally(async ()=>{
            await browser?.close();
        });
    }

    function abstract ({ block, mobile = false, referer, fingerprint, userdata, extension, debug }) {
        const puppeteer = require('puppeteer-extra').addExtra(require('puppeteer'));
        const Xvfb =  require('xvfb');
        const path = require("path");
        const os = require("os");

        //puppeteer.use(require("../../xtra/scriptinjector")({ debug }));
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
        
        let EXTENSION_PATH = extension || path.join(__dirname + "/extension");

        let args=[ 
            "--no-sandbox",
            '--disable-setuid-sandbox', 
            '--disable-blink-features=AutomationControlled', 
            '--window-size=1920,1080'];
        if (!userdata){
            args.push(`--disable-extensions-except=${EXTENSION_PATH}`)
            args.push(`--load-extension=${EXTENSION_PATH}`)
        } else {
            args.push(`--user-data-dir=${userdata}`)
        }

        return { args, puppeteer, closeSession };
    }

    const cluster = function({ threads = 10, concurrency, block, mobile = false, referer, fingerprint, userdata, extension, debug }){
        const {puppeteer,args,closeSession} = abstract({ block, mobile, referer, fingerprint, userdata, extension, debug });

        const { Cluster } = require('puppeteer-cluster');
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

        const c_ARGS = {
            concurrency: concurrency_mode,
            maxConcurrency: threads,
            puppeteerOptions: {
                headless: false,
                args
            },
            puppeteer
        };

        if (debug) console.log("puppeteer-cluster: launch options", c_ARGS);
        const clusterPromise = Cluster.launch(c_ARGS)

        return ({
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
        })
    }

    module.exports = {
        cluster,
        client
    };
}