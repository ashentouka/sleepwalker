{
	const simple = require("../fetch/client");
	simple({ method: "HEAD", url: "http://armada:6660/http.txt" }).then(response=>console.log(response))
}