{
    const loader = require("../core/cached-scraper");
    const client = require("@sleepwalker/client-puppeteer");
    const cheerio = require("cheerio");

    function runner(proto) {
        const url = "https://openproxy.space/list/" + proto;

        
            //return new Promise(resolve=>{
            function parsing(cb){
                client({}).client("https://openproxy.space/").then(page=>{
                    page.evaluate(function(){
                        localStorage.setItem("user", "oHlqdYDF85Y71Vn48U61avWL32umBxcAZTXEfsFHRa/sKFVT9KWw4lO+zqnI5wJfCwf5tTgF4y7tC5YvDfyYgnNlusHzhuL2QRmxvAX2MqT8fBFJ05Vjilxr+JQLPtTsX6wIrwx6MtfufN3h8u50XHx0jZenHm5Pr9KKRh20+RsqNVjS9tawEXMgDXfh2LLouVjbRvT7oXC1y35PFZDOM58PgQ+AIrGdz3wB7m2bShl0qo1zOPvQDQsY5Dg0p8XXDmK1irlHuZYxvogdG6HXLs71XifdXfr9Sa8j/OUhc26iuHhfJ1bfvjxl6VfKmoBhmQaBjJVs4ex4JEiQBbEvf6PzRILeQqcLRzMS477aFzOADnrfJN1p29OrM47wG7Zxk4JN8pKM0aK1/o9J8N3ctVYOBYYs8QzwfzoV2PpTY9/gCneDLds+nr11p/jhOA37wQWJ5MeNc80v5wA5y5bNNR/CQRLBTEgjvCPHfURFwW4=")
                    }).then(function(){
                        page.goto(url).then(function(){
                            //console.log("set user in localStorage");
                            page.evaluate(function(){
                                return document.querySelector("section.data textarea").value;
                            }).then(text=>{
                                page.close();
                                
                                let output = text.split("\n");
                                cb(null, output);
                            });
                        })
                    })
                })
            }
           // });  
        //} else {  
            /*promise.then(function(){
                const parser = require("../core/hybrid/parser-hybrid");
                
                return loader(url, proto, {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, function (cb) {
                    console.log("parser  for", proto);
                    parser.text(url, {
                        selector: "section.data textarea"
                    }, cb);
                })
            })*/
           return loader(url, proto, {ttl: {refresh: 60 * 1000}, auto: 10 * 60 * 1000}, parsing);
        
    }

    module.exports = {
        http(){
            return runner("http")
        },
        socks4(){
            return runner("socks4")
        },
        socks5(){
            return runner("socks5")
        },
    }
}