 
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const loader = require('../../core/cached-scraper');

function runner(){
	function nordModule(cb){
		const downloadFile = (async (url, fileName) => {
			const res = await fetch(url);
			const unzip = require("unzip");
			let proxy = [];
			let done = false;
			Readable.fromWeb(res.body).pipe(unzip.Parse()).on('entry', function (entry) {
				if (!done){
					const parts = entry.path.match(/^ovpn_udp\/(.*).udp.ovpn$/);
					if (parts) {
						proxy.push(`yqWs4t4nVDd4J78g9XgzuFDj:oPJRhmvhgzxCxm1jzGbchnut@${parts[1]}:89`)
					} else {
						done = (proxy.length > 0);
			cb(null,proxy);
					}
				}
				entry.autodrain();
		    });
		});

		downloadFile("https://downloads.nordcdn.com/configs/archives/servers/ovpn.zip");
	}
	return function () {
		return loader("https://nordvpn.com/", "https",{ ttl: { refresh: 7 * 24 * 60 * 60 * 1000 }, auto: 7 * 24 * 60 * 60 * 1000 }, nordModule);
    }
}

module.exports = {
	https: runner()
}