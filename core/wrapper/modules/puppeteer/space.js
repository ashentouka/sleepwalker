{
    const loader = require("../../core/cached-scraper");
    const cheerio = require("cheerio");
    let scraper;

    function runner(proto) {
        const url = "https://openproxy.space/list/" + proto;

        function parser(cb){
            scraper.queue(async ({ page }) => {
                await page.goto("https://openproxy.space/");
                await page.evaluate(function(){
                    localStorage.setItem("user", "oHlqdYDF85Y71Vn48U61avWL32umBxcAZTXEfsFHRa/sKFVT9KWw4lO+zqnI5wJfCwf5tTgF4y7tC5YvDfyYgnNlusHzhuL2QRmxvAX2MqT8fBFJ05Vjilxr+JQLPtTsX6wIrwx6MtfufN3h8u50XHx0jZenHm5Pr9KKRh20+RsqNVjS9tawEXMgDXfh2LLouVjbRvT7oXC1y35PFZDOM58PgQ+AIrGdz3wB7m2bShl0qo1zOPvQDQsY5Dg0p8XXDmK1irlHuZYxvogdG6HXLs71XifdXfr9Sa8j/OUhc26iuHhfJ1bfvjxl6VfKmoBhmQaBjJVs4ex4JEiQBbEvf6PzRILeQqcLRzMS477aFzOADnrfJN1p29OrM47wG7Zxk4JN8pKM0aK1/o9J8N3ctVYOBYYs8QzwfzoV2PpTY9/gCneDLds+nr11p/jhOA37wQWJ5MeNc80v5wA5y5bNNR/CQRLBTEgjvCPHfURFwW4=")
                })
                await page.goto(url);
                const text = await page.evaluate(function(){
                    return document.querySelector("section.data textarea").value;
                })
                await page.close();
                                
                let output = text.split("\n");
                cb(null, output);
            });
        }

        return function () {
            return loader(url, proto, { cron: "20 0 30 * * *", ttl: { refresh: 24 * 60 * 60 * 1000 }}, parser);
        }
    }

    module.exports = {
        init(client){
            scraper = client
        },
        http: runner("http"),
        socks4: runner("socks4"),
        socks5: runner("socks5")
    }
}