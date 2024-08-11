{
	const index = require("../source/puppeteer/client");
	const context = {
		client: null,
		page: null
	};

	(async()=>{
		context.client = await index({ 
			concurrency: "context",
			threads: 2,
			block: {
				ads: true,
				trackers: true,
				resources: true
			}
		});

		await context.client.execute(async ({page})=>{
			context.page = page;
		    await page.goto("https://www.whoer.net/");
		    const textSelector = await page.waitForSelector("#hidden_rating_link");
		    const perc = await textSelector?.evaluate(el => el.textContent);
		    console.log(perc);
		});

	})().catch(console.log)

	.finally(async function(){
		await context.client?.idle();
		if (context.page?.isClosed() === false){
			await context.page?.close(); 
		}
		await context.client?.close();
	})
}