{
  const path = require("path");
    const fs = require("fs");

  function startExpress(){
    const express = port=>{
        const express = require('express');
        const path = require("path");
        const app = express();

        app.use("/", express.static(path.join(__dirname, "static"))); 
        app.listen(port, () => console.log(`Started Express: http://localhost:${port}/`));
    }

    express(6660);
  }

  function copyLatest(){
    let descriptor = {
      timestamp: new Date().toJSON(),
      all: 0
    };
    function copyFile(type){
      const serve_path = path.resolve(__dirname + `/static/${type}.txt`);
      const export_path = path.resolve(`../armada/data/export/${type}.txt`);
      if (fs.existsSync(export_path)){
        if (fs.existsSync(serve_path)) fs.rmSync(serve_path);
        const text = fs.readFileSync(export_path, "utf-8");
        const lines = text.trim().split(/\r?\n/);
        for (let idx in lines){
          output.push(`${type}://${lines[idx]}`);
        }
        descriptor[type] = lines.length;
        descriptor.all += lines.length;
        fs.writeFileSync(serve_path, text, "utf-8");
      }
    }

    let output=[];
    copyFile("http");
    copyFile("socks4");
    copyFile("socks5");

    const DisArray = require("disarray");
    output = new DisArray().concat(output);
    fs.writeFileSync(path.resolve(__dirname + `/static/all.txt`), output.join("\n"), "utf-8");
    fs.writeFileSync(path.resolve(__dirname + `/static/info.json`), JSON.stringify(descriptor, null, 2), "utf-8");

    console.log("Successful Copy of Latest Tested Proxies from [/armada/data/export/] to [/service/static/]");
  }

  function runArmada(){
    // fs.rmSync(path.resolve("../armada/data/blacklist/"), { recursive: true, force: true});
    const armada = require("../armada/core/core");
    let promise = armada();
    promise.then(function(){
      console.log("Finished gathering and testing new proxy.");
      copyLatest();
    })
    return promise;
  }

  function setupCron(){
    const schedule = require("node-schedule");
    const job = schedule.scheduleJob("*/30 * * * *", function(){ 
      console.log(new Date().toJSON(), "Armada scheduled run started.")

      runArmada().then(function(){
        console.log(new Date().toJSON(), "Armada scheduled run completed.")
      })
    })
    console.log("Scheduled armada to provide fresh proxy hourly.");
  }


  // Startup
  // Sequence
  copyLatest();
  startExpress();
  runArmada()
    .then(setupCron);
  //\\
  ////
}