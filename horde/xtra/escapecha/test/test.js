{
	const cluster = require("../../../source/puppeteer/index");
	const colors = require("chalk-css-colors");

	const scraper = cluster({ debug: true });

	const nord = server=>`https://yqWs4t4nVDd4J78g9XgzuFDj:oPJRhmvhgzxCxm1jzGbchnut@${server}.nordvpn.com:89`;

	scraper.execute(async function({ page }){
		try {
			await page.setProxy(nord("ch360"));
			await page.goto("https://ouo.io/j9c5h8");
			await page.waitForTimeout(5000);
			await page.screenshot({ path: "ouo.png" });
			console.log ("cloudflare", colors.aquamarine("SOLVED"));
		} catch(ex) {
			console.log(ex);
			console.log ("cloudflare", colors.crimson("UNSOLVED"));
		}
	})
/*
	scraper.execute(async function({ page }){
		try {
			await page.setProxy(nord("us8040"));
			await page.goto("https://nopecha.com/demo/cloudflare");
			await page.waitForTimeout(5000);
			await page.screenshot({ path: "cloudflare.png" });
			console.log ("cloudflare", colors.aquamarine("SOLVED"));
		} catch(ex) {
			console.log(ex);
			console.log ("cloudflare", colors.crimson("UNSOLVED"));
		}
	})

	scraper.execute(async function({ page }){
			await page.setProxy(nord("uk2513"));
		await page.goto("https://nopecha.com/demo/recaptcha");
		
		const result = await page.solveRecaptcha();
		console.log ("recaptcha", result.solved ? colors.aquamarine("SOLVED") : colors.crimson("UNSOLVED"));
		page.close();
	})
*/
	scraper.idle().then(_=>{
		scraper.close();
	})
}