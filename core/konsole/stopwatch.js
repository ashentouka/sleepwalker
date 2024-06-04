{
    module.exports = class StopWatch {
        constructor() {
            this.start = new Date().getTime();
        }

        time() {
            const _n = new Date();
            return _n.getTime() - this.start;
        }
    }
}