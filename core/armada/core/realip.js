{
    function start() {
            const simple = require("@sleepwalker/client-simple");
            const ipinfo = simple.ipinfo();
            return (ipinfo);
    }
    module.exports = start
}