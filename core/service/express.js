 {
 	function latestProxyShareService(){
	    const express = require('express');
	    const path = require("path");
	    const app = express();

	    app.use("/", express.static(path.join(__dirname, "static"))); 

	    let port = 6660;
	    app.listen(port, () => console.log(`Started Express: http://localhost:${port}/`));
	}
	latestProxyShareService();
}