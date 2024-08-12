 {

    async function checkStat({ page }) {
        return new Promise(async (resolve, reject) => {

            var st = setTimeout(() => {
                clearInterval(st)
                resolve(false)
            }, 4000);
            try {
                //await page.mouse.move(page.getRandom(1920), page.getRandom(1080), { steps: page.getRandom(5)});
                const elements = await page.$$('[name="cf-turnstile-response"]');

                if (elements.length <= 0) return resolve(false);

                for (const element of elements) {
                    try {
                        const parentElement = await element.evaluateHandle(el => el.parentElement);

                        const box = await parentElement.boundingBox();

                        const x = box.x + box.width / 2;
                        const y = box.y + box.height / 2;

                        await page.mouse.click(x, y);
                    } catch (err) { }
                }
                clearInterval(st)
                resolve(true)
            } catch (err) {
                // console.log(err);
                clearInterval(st)
                resolve(false)
            }
        })
    }



    async function goto(url){
         
            var solve_status = true


/*            const setSolveStatus = ({ status }) => {
                solve_status = status
            }*/

            const autoSolve = async ({ page }) => {
                return new Promise(async (resolve, reject) => {
                    while (solve_status) {
                        try {
                            await page.waitForTimeout(1500)
                            let result = await checkStat({ page }).catch(err => { })
                            
                            if (!result) {
                                solve_status = false;
                            } else {
                                if (debug) console.log("cloudflare turnstile: attempting solve");
                            }
                        } catch (err) { }
                    }
                    resolve()
                })
            }
            if (debug) console.log("goto", url);
            //await page.mouse.move(page.getRandom(1920), page.getRandom(1080), { steps: page.getRandom(5)});
            await page_goto_origin.call(page, url, { waitFor: "networkidle2" });
            //setSolveStatus({ status: true })
            if (debug) console.log("do autoSolve");
            await autoSolve({ page })
            
        
    }

    async function init() {
        page_goto_origin = page.goto;
        page.goto = goto;
    }

    let page;
    let debug = false;
    let page_goto_origin;

    module.exports = {
        async init(pp, dbg){
            if (pp) {
                page = pp;
            }
            if (dbg === true) {
                debug = true;
            }
            await init();
        }
    }
}