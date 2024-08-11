{
	const fs = require("fs");
	async function test() {
		const filename = "/tmp/escapecha/019111f1-0f8f-7fff-815f-91192e9c8fdf.wav"
		const { Wit } = require("node-wit"), wit = new Wit({accessToken:"DQ7RX7EQZDEEDV75WOI4AN7KZ4ARC2CR"});
		const response = await wit.dictation('audio/mpeg', fs.FileReadStream(filename));

		console.log(response);
	}

	test();
}
