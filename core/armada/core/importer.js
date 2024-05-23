{
    let minimal = false, rescan = false, doimport = false, untested = false, debug = false;
    
    
    (function argv_parse() {
        for (let argdx in process.argv) {
            if (process.argv[argdx] === "--rescan") {
                rescan = true;
                break;
            } else if (process.argv[argdx] === "--minimal") {
                minimal = true;
                break;
            } else if (process.argv[argdx] === "--import") {
                doimport = true;
                break;
            } else if (process.argv[argdx] === "--untested") {
                untested = true;
                break;
            } else if (process.argv[argdx] === "--debug") {
                debug = true;
                break;
            }
        }
    })();

    
    const { chalk, konsole, gradient } = require("@sleepwalker/konsole");
    const klog = konsole("proxyarmada", "red").submodule("importer", "cyan");

    require('require-json5');
    const source_fn = minimal ? "../minimal.json5" : "../sources.json5";
    const sources = require(source_fn);
    const fs = require("fs");
    const path = require("path");
    const async = require("async")

    const protocols = ["http", "socks4", "socks5"];
    const protocolsFour = ['https'].concat(protocols);
    const datastore = require("./datastore");
 //   const ip_port_regex = /([1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}\.[1-2]?\d{1,2}:\d{2,5})/
    const ip_port_regex = /(?:(\w+)(?::(\w*))@)?([a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})|((?:\d{1,3})(?:\.\d{1,3}){3}))(?::(\d{1,5}))$/;
    const printstacks = false;
    const parsers = {
        current: 0,
        total: 0
    }

    let proxproto = {
        http: datastore.armada.http.loadCache(),
        socks4: datastore.armada.socks4.loadCache(),
        socks5: datastore.armada.socks5.loadCache(),
        totalunique: 0,
        totalsubmit: 0
    };

    proxproto.totalsubmit = (proxproto.totalunique = (proxproto.http.length +
        proxproto.socks4.length + proxproto.socks5.length));

    function proxyURL(proto, data){
        if (!proxproto[proto].includes(data)) {
            proxproto.totalunique++;
            proxproto[proto].push(data)
        }
    }

    function sourceComplete(tree, proto, name, callback) {
        parsers.current++;
        klog[debug?"logger":"replace"](chalk.cyanBright(`${parsers.current}/${parsers.total}> imported ${tree.length} ${proto} proxy from: ${name}`));
        proxproto.totalsubmit += tree.length;
        callback();
    }

    function sourceIncomplete(e, proto, name, cb) {
        parsers.current++;
        klog.logger(chalk.redBright(`${parsers.current}/${parsers.total}> Error importing Proxy [type: ${name}] Path: ${proto}`));
        if (printstacks) console.log(e);
        cb()
    }

    function iterateFour(f) {
        for (let prx = 0; prx < protocolsFour.length; prx++) {
            f(protocolsFour[prx]);
        }
    }

    function createPath(source, type) {
        let prequery = source.site + source[type];
        if (source.site.indexOf("github") > -1) return prequery;
        return prequery + (prequery.indexOf("?") > -1 ? "&" : "?") + `anticache=${new Date().getTime()}`
    }

    function simpleHtmlScraperFactory(source) {
        return function simpleHtmlScraper (tree, name, proto, callback) {
            if (proto === 'https') proto = 'http';
            for (let idx = 0; idx < source.length; idx++) {
                proxyURL(proto, tree[idx]);
            }
            sourceComplete(tree, proto, name, callback);
        }
    }

    function proxyArrayParserFactory(source) {
        return function proxyArrayParser (tree, name, proto, callback) {
            if (proto === 'https') proto = 'http';
            for (let idx = 0; idx < tree.length; idx++) {
                proxyURL(proto, tree[idx]);
            }
            sourceComplete(tree, proto, name, callback);
        }
    }

    function proxyJsonParserFactory(source) {
        return function proxyJsonParser (tree, name, proto, callback) {
            if (proto === 'https') proto = 'http';

            for (let idx = 0; idx < tree.length; idx++) {
                proxyURL(proto, eval(source.pattern));
            }
            sourceComplete(tree, proto, name, callback);
        }
    }

    function proxyTextParserFactory() {
        return function proxyTextParser (body, name, proto, callback) {
            if (proto === 'https') proto = 'http';
            let lines = body.split(/\r?\n/);
            lines.forEach(line => {
                if (ip_port_regex.test(line)) proxyURL(proto,line);
            
            });
            sourceComplete(lines, proto, name, callback);
        }
    }

    function proxyListFile(source, type, parser, cb) {
        fs.readFile(path.join(source.path, source[type]), 'utf-8', (e, d) => {
            if (e) {
                sourceIncomplete(e, source[type], "file", cb);
            } else {
                parser(d, source[type], type, cb);
            }
        });
    }

    function proxyListPaged(source, type, parser, cb) {
        const {rest} = require("./proxyparser/simple");
        let path = createPath(source, type);
        rest(path, source, (e, d) => {
            if (e) {
                sourceIncomplete(e, source.site, "rest", cb);
            } else {
                parser(d, source.site, type, cb);
            }
        })
    }

    function proxyListPuppeteer(source, type, parser, cb) {
        const {puppeteer} = require("./proxyparser/puppeteer");
        let path = createPath(source, type);
        puppeteer(path, source, (e, d) => {
            if (e || !d) {
                sourceIncomplete(e, path, "puppeteer", cb);
            } else {
                parser(d, source.site, type, cb);
            }
        })
    }

    function proxyListURL(source, type, parser, cb) {
        const {plaintext} = require("./proxyparser/simple");
        let path = createPath(source, type);
        let tries = 0;
        function load(){
            tries++;
            plaintext(path, source, (e, d) => {
                if (e) {
                    if (tries < 3) {
                        setTimeout(load, 500);
                    } else {
                        sourceIncomplete(e, path, "url", cb);
                    }
                } else {
                    parser(d, source.site, type, cb);
                }
            })
        }
        setTimeout(load, 500);
    }

    function proxyListLinks(source, cb) {
        const {links} = require("./proxyparser/puppeteer");

        links(source.site, source, (e, d) => {
            if (e) {
                sourceIncomplete(e, source.site, "links", cb);
            } else {
                for (let newq = 0; newq < d.results.length; newq++) {
                    let newf = sourceFactory(d.results[newq]);
                    iterateFour(newf);
                }
                cb()
            }
        })
    }

    function proxyGithub(source, cb) {
        const site = "https://raw.githubusercontent.com/";
        for (let repo_idx in source.repos) {
            let repo_data = source.repos[repo_idx];
            repo_data.site = site + repo_idx;

            let newf = sourceFactory(repo_data);
            iterateFour(newf);
        }
        cb();
    }

    function proxyWS(source, cb) {
        const site = source.env[source.env.use];
        for (let idx = 0; idx < source.endpoints.length; idx++) {
            let _ep = source.endpoints[idx];
            _ep.site = site;

            let newf = sourceFactory(_ep);
            iterateFour(newf);
        }
        cb();
    }

    const SourceType = Object.freeze({
        html: {go: simpleHtmlScraperFactory},
        file: {go: proxyListFile},
        links: {go: proxyListLinks},
        github: {go: proxyGithub},
        proxywrapper: {go: proxyWS},
        puppeteer: {go: proxyListPuppeteer},
        rest: {go: proxyListPaged},
        url: {go: proxyListURL}
    })

    const FormatType = Object.freeze({
        txt: {go: proxyTextParserFactory},
        json: {go: proxyJsonParserFactory},
        array: {go: proxyArrayParserFactory}
    })

    function enshroud(source, type, parser, cb) {
        let what = SourceType[source.type || "url"];
        what.go(source, type, parser, cb);
    }

    let queue = async.queue((task, callback) => {
        task(callback);
    }, 12);

    function resolveParser(source) {
        if (source.parser) {
            return source.parser;
        } else if (source.type === 'table' || source.type === 'html') {
            return "array";
        } else if (source.type === 'rest') {
            return "json";
        } else {
            return "txt";
        }
    }

    function sourceFactory(source) {
        let parser = FormatType[resolveParser(source)].go(source);
        return function readProxyTypeFromSource(type) {
            if (source.hasOwnProperty(type)) {
                queue.push(cb => enshroud(source, type, parser, cb));
                parsers.total++;
            }
        }
    }

    let links = [];
    let others = [];

    if (untested) {
        filespath("untested");
    } else if (!rescan) {
        if (!doimport) {
            for (let sidx = 0; sidx < sources.length; sidx++) {
                let source = sources[sidx];
                if (source.type === "links" || source.type === "github" || source.type === "proxywrapper") {
                    links.push(function (cb) {
                        SourceType[source.type].go(source, cb)
                    });
                } else {
                    others.push(sources[sidx]);
                }
            }
            if (!minimal) filespath("import")
        } else {
            filespath("import")
        }
    }

    function filespath(fpath) {
        let opath = path.resolve(__dirname + "/../data/" + fpath);
        if (!fs.existsSync(opath)) fs.mkdirSync(opath);
        let files = fs.readdirSync(opath);
        for (let idx = 0; idx < files.length; idx++) {
            if (files[idx].toLowerCase().indexOf("socks4") > -1) {
                others.push({type: "file", path: opath, "socks4": files[idx]});
            } else if (files[idx].toLowerCase().indexOf("socks5") > -1) {
                others.push({type: "file", path: opath, "socks5": files[idx]});
            } else {
                others.push({type: "file", path: opath, "http": files[idx]});
            }
        }
    }

    function init() {
        klog.logger(`has started importing from all sources [${source_fn}]`);

        return new Promise(resolve => {
            async.series(links, () => {
                others.forEach(source => {
                    let proxyHandler = sourceFactory(source);
                    iterateFour(proxyHandler);
                })

                klog.logger("proxy build handler(s) assigned, start parsing sources:");
                queue.error((task,error)=>{
                  console.log("queue error", task, error);
                })
                queue.drain(function () {
                    klog.replace("finished reading from all sources.");

                    if (proxproto.totalunique > 0) {
                        klog.logger(`loaded ${chalk.cyan(proxproto.totalunique)} proxies [${
                            gradient.retro(`${proxproto.http.length} http|${proxproto.socks4.length} socks4|${proxproto.socks5.length} socks5`)
                            }] ${chalk.red(proxproto.totalsubmit - proxproto.totalunique)} duplicates filtered out`);
                        datastore.untested.save(proxproto);
                        resolve(proxproto);
                    }
                })
            })
        })
    }

    module.exports = init;
}