{
  const path = require("path");
    const fs = require("fs");

//  const cmd = require("node:child_process");

/*  function startExpress(){
    cmd.exec(`cd "${path.resolve(__dirname)}" && bash -c "./express.sh"`, (error, stdout, stderr)=>{
      console.log("stdout:",stdout);
      console.log("stderr:",stderr);
      console.log("error:",error);
    });
  }*/

  function startExpress(){
    const express = require("./express");
    //express();
  }

  function copyLatest(){
    function copyFile(fn){
      fs.rmSync(path.resolve(__dirname + "/static/" + fn));
      fs.copyFileSync(path.resolve("../armada/data/export/" + fn), path.resolve(__dirname + "/static/" + fn));
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