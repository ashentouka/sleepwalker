{
  	(async function start(){
	  const component = require("./svcontrols");
	  let me = component("service");
	  await me.start(true);
	})();
}