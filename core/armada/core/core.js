{
    
    const { StopWatch, komponent } = require("@sleepwalker/konsole");
    const SegfaultHandler = require('segfault-handler');
        SegfaultHandler.registerHandler('crash.log');
    
    let log = komponent("proxyarmada","red");

    function catcher(msg){
        return function (e){
            log.logger(msg);
            console.error(e);
        }
    }

    function start() {
        return new Promise(resolve => {
            const syserr = (comp => { return catcher("core system failure in: " + comp)});

            log.logger("time to assemble the armada!");

            const importer = require("./importer");
            importer().then(proxproto => {

                const proxytester = require("./proxytester");
                proxytester(proxproto,syserr).then(data=>{ 
                    log.logger("armada assembled (finished)."); 
                    resolve(data);
                });
                
            }).catch(syserr("importer"));
        })
    }

    if (require.main !== module) {
        module.exports = start;
    } else {
        start().then();
    }
}