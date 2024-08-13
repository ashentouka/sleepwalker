{
	const DisArray = require("@sleepwalker/disarray");
	const path = require("path");
	const fs = require("fs");
	const os = require("os");
	
	const dir_data = os.homedir()+"/.sleepwalker/";
	const dir_exp = (dir_data+ "/export/");
	const file_db = path.join(dir_data, "armada.db");
	const Database = require('better-sqlite3');

	let db;

	(function setupDatabase() {
		if (!fs.existsSync(dir_exp)) fs.mkdirSync(dir_exp, { recursive: true });
		if (!fs.existsSync(dir_data)) fs.mkdirSync(dir_data, { recursive: true });
		const create = !fs.existsSync(file_db);
		db = new Database(file_db);
		db.pragma('journal_mode = WAL');

		if (create) {
			db.exec("CREATE TABLE temp (protocol TEXT, proxy TEXT, country TEXT, state TEXT, residential INTEGER, score INTEGER)");
			db.exec("CREATE TABLE proxy (protocol TEXT, proxy TEXT, country TEXT, state TEXT, residential INTEGER, score INTEGER)");
			db.exec("CREATE TABLE millis (millis INTEGER)");
			db.exec("INSERT INTO millis (millis) values (0)");
		}
	})();

	module.exports = {

		saveProxy({ protocol, proxy, country, state, residential }){
			const stmt = db.prepare("INSERT INTO temp (protocol, proxy, country, state, residential) VALUES (?,?,?,?,?)");
			stmt.run([ protocol, proxy, country, state, residential ]);
		},

		saveScore({ proxy, score }){
			const stmt = db.prepare("UPDATE temp set score = ? where proxy = ?");
			stmt.run([ score, proxy ]);
		},

		promote() {
			db.exec("DELETE from proxy");
			db.exec("INSERT INTO proxy SELECT * FROM temp");
			db.exec("DELETE from temp");
			const stmt = db.prepare("UPDATE millis set millis = ?");
			stmt.run(new Date().getTime());
		},

		getSummary(){
			function stamp() {
				let sql = "SELECT millis from millis";
				const stmt = db.prepare(sql);
				const { millis } = stmt.get();
				return millis;
			}

			function count(protocol) {
				let sql = "SELECT count(proxy) as nump from proxy WHERE protocol = ?"
				let stmt = db.prepare(sql);
				const { nump } = stmt.get(protocol);
				return nump;
			}

			const timestamp = stamp();
			const http = count("http");
			const https = count("https");
			const socks4 = count("socks4");
			const socks5 = count("socks5");
			const all = (http + socks4 + socks5);

			return { timestamp, http, https, socks4, socks5, all };
		},

		getProxy({ protocol, country, state, residential, score }){
			console.log("getProxy", { protocol, country, state, residential, score });
			let sql = "SELECT * from proxy";
			let where = false;
			let params = [];
			function handleParam(n,p){
				if (p) { 
					let or = false;
					sql+= ((!where)?" WHERE (":" AND (");
					for (let v of (p instanceof Array ? p: [p])){
						if (or) sql += " OR "; 
						sql += n + " = ?"; 
						params.push(v);
						or = true;
					}
					sql += ")"; 
					where = true; 
				}
			}
			
			handleParam("protocol", protocol);
			handleParam("country", country);
			handleParam("state", state);

			if (typeof residential !== "undefined") { sql+= ((!where)?" WHERE ":" AND ") + "residential = ?"; params.push(1); where = true; }
			if (typeof score !== "undefined") { sql+= ((!where)?" WHERE ":" AND ") + "score <= ?"; params.push(score); where = true; }

			let output = new DisArray();
			const stmt = db.prepare(sql);
			const proxies = stmt.all(params);
			for (let idx in proxies){
				const proxy = `${proxies[idx].protocol}://${proxies[idx].proxy}`;
				if (!output.includes(proxy)) output.push(proxy);
			}
			return output;
		},

		getProxyList(protocol){
			let sql = "SELECT proxy from proxy WHERE protocol = ?";
			
			let output = [];
			const stmt = db.prepare(sql);
			const proxies = stmt.all(protocol);
			for (let idx in proxies){
				const proxy = proxies[idx].proxy;
				if (!output.includes(proxy)) output.push(proxy);
			}
			return output;
		},

		cleartemp(){
			db.exec("DELETE from temp");
		},

		close(){
			db.close();
		},

		export(){
			for (p of ["http", "https", "socks4", "socks5"]){
				function exp(protocol){
					let data=module.exports.getProxyList(protocol);
					console.log(`wrote ${data.length} to ${protocol}.txt`);
					fs.writeFileSync(path.join(dir_exp, protocol + ".txt"), data.join("\n"), "utf-8");
				}
				exp(p);
			}
		}
	}
}