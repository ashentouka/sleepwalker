{
    let loaded;
    if (!loaded){
        (function monkeylogger(method){
            let syscall = console[method];
            console[method] = function (...args) {
                if (/\(node:\d+\) (\[DEP\d+\] Deprecation)?Warning:/.test(args[0])) {
                    return;
                }
                syscall.apply(console, args);
            }
            return monkeylogger;
        })("log")("debug")("info")("warn")("error")("trace");


        const SegfaultHandler = require('segfault-handler');
        SegfaultHandler.registerHandler('crash.log');

        process.on('unhandledRejection', (reason, p) => {
            console.trace(reason, 'Unhandled Rejection at Promise', p);
        }).on('uncaughtException', err => {
            console.trace(err, 'Uncaught Exception thrown');
            //process.exit(1);
        });
        loaded = true;
    }
}