module.exports = (client) => {
    return function () {
        return new Promise((resolve, reject) => {
            client("http://ipinfo.io/json").then(async page => {


                await page.content();

                let innerText = await page.evaluate(() => {
                    return JSON.parse(document.querySelector("body").innerText);
                });

                console.log("innerText now contains the JSON");
                console.log(innerText);
                page.close()

                resolve(innerText);
            }).catch(reject);
        })
    }
}

