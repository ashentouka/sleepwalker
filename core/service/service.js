{
  const path = require("path");
    const fs = require("fs");

  function startExpress(){
    const express = require("./express");
  }

  function copyLatest(){
    function copyFile(fn){
      const serve_path = path.resolve(__dirname + "/static/" + fn);
      const export_path = path.resolve("../armada/data/export/" + fn);
      if (fs.existsSync(export_path)){
        if (fs.existsSync(serve_path)) fs.rmSync(serve_path);
        fs.copyFileSync(export_path, serve_path);
      }
    }

    copyFile("http.txt");
    copyFile("socks4.txt");
    copyFile("socks5.txt");
    
    console.log("Successful Copy of Latest Tested Proxies from [/armada/data/export/] to [/service/static/]");
  }

  function runArmada(){
    fs.rmSync(path.resolve("../armada/data/blacklist/"), { recursive: true, force: true});
    const armada = require("../armada/core/core");
    let promise = armada();
    promise.then(function(){
      console.log("Finished gathering and testing new proxy.");
      copyLatest();
    })
    return promise;
  }

  function startWrapper(){
    const wrapper = require("../wrapper-service/servo");
    console.log("Started the wrapper service.");
    return wrapper();
  }

  function setupCron(){
    const schedule = require("node-schedule");
    const job = schedule.scheduleJob('* * /1 * * *', runArmada)
    console.log("Scheduled armada to provide fresh proxy hourly.");
  }


  // Startup Sequencer
  copyLatest();
  startExpress();
    startWrapper().then(function(){
    runArmada().then(setupCron)
  })
}