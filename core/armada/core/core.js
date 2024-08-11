{
    
    const { StopWatch, gradient, komponent } = require("@sleepwalker/konsole");
    
    let log = komponent("proxyarmada","red");

    const fs = require("fs");
    const path = require("path");
    const ascii = fs.readFileSync(path.resolve(__dirname + "/../ascii"));
    console.log(gradient.vice(ascii));

    function catcher(msg){
        return function (e){
            log.logger(msg);
            console.error(e);
        }
    }

    function start() {
        return new Promise(resolve => {
            const syserr = (comp => { return catcher("core system failure in: " + comp)});

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