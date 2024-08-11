{
	const DisArray = require("../disarray");

	let da = new DisArray(0,1,2);
	let da2 = da.concat([3,4],[5,6,7])

console.log(da);
	console.log("Test One: imports data from constructor:", (da2.length === 8) ? "PASS" : "FAIL");
console.log(da2);
	console.log("Test Two: data passed to concat merged with existing and randomized:", (da2[0] !== 0 || da2[7] !== 7) ? "PASS" : "FAIL");
}