{
    const importer = require("./importer"),
        proxytester = require("./proxytester");

    const { StopWatch, konsole } = require("@sleepwalker/konsole").konsole("proxyarmada","red").logger;
    const SegfaultHandler = require('segfault-handler');
        SegfaultHandler.registerHandler('crash.log');
    
    function catcher(msg){
        return function (e){
            konsole(msg);
            console.error(e);
        }
    }

    function start() {
        return new Promise(resolve => {
            const syserr = (comp => { return catcher("core system failure in: " + comp)});

            importer().then(proxproto => {
                proxytester(proxproto,syserr).then(d=>{ konsole("armada assembled (finished)."); resolve(d) });
            }).catch(syserr("importer"));
        })
    }

    if (require.main !== module) {
        module.exports = start;
    } else {
        start().then();
    }
}