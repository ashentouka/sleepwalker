module.exports = function (debug) {
    process.on('unhandledRejection', (reason, p) => {
        if (debug) console.trace(reason, 'Unhandled Rejection at Promise', p);
    }).on('uncaughtException', err => {
        if (debug) console.trace(err, 'Uncaught Exception thrown');
        //process.exit(1);
    });
}