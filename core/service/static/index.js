{
	let timestamp;

	function update(){
		const MINUTE_MILLIS = (60 * 1000);
		const millis = (new Date().getTime() - timestamp);
		const minutes = Math.floor(millis/MINUTE_MILLIS);
		const seconds = Math.floor((millis-(minutes*MINUTE_MILLIS))/1000);
		return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	function info(){
		const socket = new WebSocket(`info`);
		socket.addEventListener("message", (event) => {
			const data = JSON.parse(event.data);
				timestamp = data.timestamp;
				document.querySelector("#all").innerText = `All Proxies (${data.all})`;;
				document.querySelector("#http").innerText = `${data.http} HTTP`;
				document.querySelector("#https").innerText = `${data.https} HTTPS`;
				document.querySelector("#socks4").innerText = `${data.socks4} SOCKS4`;
				document.querySelector("#socks5").innerText = `${data.socks5} SOCKS5`;
			})
	}
	(_=>{
		info();
		setInterval(function(){
			if (timestamp) document.querySelector(".lastUpdateMinutes").innerText = update();
		},250);
	})()

	let imbn = document.getElementById("import");
	imbn.addEventListener("click", () => {
		let divvy = document.create
	});

	function resetcenter() {
		let ele = document.querySelector("#proxbox");
		const lefty = Math.floor((window.innerWidth - ele.offsetWidth)/2) + "px";
		const topty = Math.floor((window.innerHeight - ele.offsetHeight)/2) + "px";
		ele.style.top = topty;
		ele.style.left = lefty;
	}

	function tail(what){
		const ANSI = "\u001B[1F\u001B[G\u001B[2K";
		let lines = [];

		for (let x = 0; x < 40; x++){
			lines.push(".");
		}

/*		lines = lines.concat([
			"[/////  PROXY  ARMADA  \\\\\\\\\\][.....  boxy  tostada  .....]",
            "[.....  dusty  piñata  .....][\\\\___medulla_oblongata___//]",
            "[===============]  drank yo piña colada! [===============]",
            " o o o o o o   time to assemble the armada!   o o o o o o ",
            ".",".",".","."
		])
*/
		// Create WebSocket connection.
		const socket = new WebSocket(`logs`);
		const target = document.querySelector(`#${what} pre`);

		// Connection opened
		socket.addEventListener("open", (event) => {
		  socket.send(JSON.stringify({ action: "tail", log: what }));
		});

		// Listen for messages
		socket.addEventListener("message", (event) => {
			let line = event.data;
			if (line.includes(ANSI)) {
				line = line.replace(ANSI, "");
				lines[lines.length-1] = line;
			} else {
				lines.push(line);
			}

			target.innerText = lines.join("\n");
			const container = document.querySelector(`#${what}`);
			container.scrollTop = container.scrollHeight;
		});
	}

	setTimeout(function() {
		tail("wrapper");
		tail("armada");

		resetcenter();
	}, 500);

	addEventListener("resize", (event) => {
		resetcenter();
	});
}