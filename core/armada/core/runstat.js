{
    let runstat;
    const { colors, chalk, komponent, gradient, StopWatch } = require("@sleepwalker/konsole");
    const klog = komponent("proxyarmada","red").komponent("proxytester","magenta");

    module.exports = function (total,armada) {
        function reportStatus() {
            let millis = runstat.start.time();
            const percent = runstat.tested/runstat.total;
            let stats = `tested [${gradient.atlas(`${runstat.tested}/${runstat.total}`)}>>${chalk.rgb(100,100,250)((percent*100)
                .toFixed(2))}%] :: [${colors.cyan(runstat.good+runstat.x2)} good/${colors.red(runstat.bad)} bad] :: [${
                    gradient.vice(`${armada.http.length} http|${armada.https.length} https|${armada.socks4.length} socks4|${armada.socks5.length} socks5`)}] <${
                        colors.orange(runstat.x2)
                    } switch:http/s >`;
            klog.replace(`${(millis/1000/60).toFixed(2)} minutes: ${stats}`)
        }
        
        let status_interval = setInterval(reportStatus, 1500);

        runstat = {
            start: new StopWatch(),

            total: total,
            tested: 0,
            bad: 0,
            good: 0,
            x2: 0
        };

        return {
            status: reportStatus,
            bad: ()=>{ runstat.bad++; runstat.tested++ },
            good: ()=>{ runstat.good++; runstat.tested++ },
            stop: ()=>{ clearInterval(status_interval); reportStatus(); }
        }
    }
}