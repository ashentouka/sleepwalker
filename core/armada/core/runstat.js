{
    let runstat;
    const { chalk, komponent, gradient, StopWatch } = require("@sleepwalker/konsole");
    const klog = komponent("proxyarmada","red").komponent("proxytester","magentaBright");

    module.exports = function (total,armada) {
        function reportStatus() {
            let millis = runstat.start.time();
            const percent = runstat.tested/runstat.total;
            let stats = `tested [${gradient.atlas(`${runstat.tested}/${runstat.total}`)}>>${chalk.rgb(100,100,250)((percent*100)
                .toFixed(2))}%] :: [${chalk.cyanBright(runstat.good)} good/${chalk.red(runstat.bad)} bad] :: [${
                    gradient.retro(`${armada.http.length} http|${armada.socks4.length} socks4|${armada.socks5.length} socks5`)}]`;
            klog.replace(`${(millis/1000/60).toFixed(2)} minutes: ${stats}`)
        }
        
        let status_interval = setInterval(reportStatus, 200);

        runstat = {
            start: new StopWatch(),

            total: total,
            tested: 0,
            bad: 0,
            good: 0
        };

        return {
            status: reportStatus,
            bad: ()=>{ runstat.bad++; runstat.tested++ },
            good: ()=>{ runstat.good++; runstat.tested++ },
            stop: ()=>{ clearInterval(status_interval); reportStatus(); }
        }
    }
}