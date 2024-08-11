{
	const cluster = require("../../../source/puppeteer/index");
	const colors = require("chalk-css-colors");

	const scraper = cluster({ debug: true });

	scraper.execute(async function({ page }){
		try {
			await page.setProxy("https://yqWs4t4nVDd4J78g9XgzuFDj:oPJRhmvhgzxCxm1jzGbchnut@ie188.nordvpn.com:89");
			//await page.goto("https://nopecha.com/demo/cloudflare");
			await page.goto("https://ouo.io/j9c5h8");
			await page.waitForTimeout(5000);
			await page.screenshot({ path: "SOLVED.png" });
			console.log ("cloudflare", colors.aquamarine("SOLVED"));
		} catch(ex) {
			console.log(ex);
			console.log ("cloudflare", colors.crimson("UNSOLVED"));
		}
	})
/*
	scraper.execute(async function({ page }){
		//await page.goto("https://patrickhlauke.github.io/recaptcha/", { waitUntil: "networkidle2" });
		await page.goto("https://www.seoreviewtools.com/website-traffic-checker/", { waitUntil: "networkidle2" });
		
		const result = await page.solveRecaptcha();
		console.log ("recaptcha", result.solved ? colors.aquamarine("SOLVED") : colors.crimson("UNSOLVED"));
		page.close();
	})*/

	scraper.idle().then(_=>{
		scraper.close();
	})
}