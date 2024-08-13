{
  	(async function start(){
	  const component = require("./svcontrols");
	  let me = component("service");
	  if (process.argv[2] !== "stop" && process.argv[2] !== "kill"){
	  	await me.start(true);
	  } else {
	  	await component("armada").stop();
	  	await component("wrapper").stop();
	  	await me.stop();
	  }
	})();
}