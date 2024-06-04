{
	let test_mod = process.argv[2];
	const mod = require(`../modules/${test_mod}.js`);
	const all_protocols = ['http', 'https', 'socks4', 'socks5'];
    for (let proto_idx in all_protocols) {
        let proto = all_protocols[proto_idx];
        if (mod[proto]) {
        	const res = mod[proto]().then(data=>console.log(proto,data)).catch(console.trace);
        }
    }

}