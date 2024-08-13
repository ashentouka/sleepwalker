function component(name){

    const path = require("path");
    const fs = require("fs");

    const {location,script} = (function(){
      switch(name){
        case "armada":
          return {
            location: path.resolve(__dirname+"/../armada/"),
            script: "core/core.js"
          }
        case "wrapper":
          return {
            location: path.resolve(__dirname+"/../wrapper/"),
            script: "servo.js"
          }
        case "service":
        default:
          return {
            location: __dirname,
            script: "service.js"
          }
    }})();

    return API = {
      async running(){
        return new Promise(resolve=>{
          const { exec } = require("node:child_process");
          exec("ps -ef | grep "+script, (stdout, stderr, err)=>{
            let pids=[];
            let lines=stderr.trim().split(/\n/);
            for (let proc of lines) {
              if (!(/.*grep.*/.test(proc))) {
                pids.push(proc.match(/^\S+\s+(\d+)/)[1]);
              }
            }
            resolve(pids);
          })
        })
      },
      async start(restart=true){
        console.log(name,"start()");
        return new Promise(async resolve=>{
          if (restart) await API.stop();
          const { exec } = require("node:child_process");
          exec(location+"/"+name+".sh", (stdout, stderr, err)=>{
            resolve(!err);
          })
        })
      },
      async stop(){
        console.log(name,"stop()");
        return new Promise(async resolve=>{
          const pids = await API.running();
          for (pid of pids) {
            const { exec } = require("node:child_process");
            exec("kill -9 "+pid, (stdout, stderr, err)=>{ })
          }
          resolve();
        })
      }
    }
}

module.exports = component