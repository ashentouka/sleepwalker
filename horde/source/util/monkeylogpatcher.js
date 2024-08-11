{
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
}