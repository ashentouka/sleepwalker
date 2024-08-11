{
  const path = require("path");
  const fs = require("fs");
  
  const fnfile = __dirname + "/filenum.json";
  const impath = path.resolve(__dirname + `/../data/import/`);
  
  function savefnfile(fndata){
    fs.writeFileSync(fnfile, JSON.stringify(fndata));
  }

  let filenumbers = (function(){
    if (!fs.existsSync(impath)) fs.mkdirSync(impath, { recursive: true });
    if (fs.existsSync(fnfile)){
      return require(fnfile);
    } else {
      let fn = { http: 0, https: 0, socks4: 0, socks5: 0 };
      savefnfile(fn);
      return fn;
    }
  })();

  function startExpress(){
     const express = port=>{
        const data = require("../data/datasourcery");
        const bodyParser = require("body-parser");
        const express = require('express');
        const path = require("path");
        const app = express();
        require('express-ws')(app);

        app.use("/", express.static(path.join(__dirname, "static"))); 
        app.ws('/logs', function(ws, req) {
          ws.on('message', function(msg) {
            let wdata = JSON.parse(msg);

            if (wdata.action === "tail") {
                const { Tail } = require('tail');
                const logfile = new Tail(path.join(__dirname, wdata.log === "armada" ? "/../armada/armada.log" : "/../wrapper/wrapper.log" ), 
                    { nLines: 10000 });
                logfile.on("line", function(data) {
                  ws.send(data);
                });
            }
          });
        });

        app.get('/proxies', (req, res) => {
            const output = data.getProxy(req.query);
            res.set('Content-Type', 'text/plain');
            res.send(output.join("\n"));
        });
        
        // parse an HTML body as a string
        app.use(bodyParser.text({ type: 'text/*' }))
        app.post('/import/:proto', (req,res) => {
          try {
            filenumbers[req.params["proto"]]++;
            savefnfile(filenumbers);
            let fpath = path.resolve(`${impath}/${req.params["proto"]}-${filenumbers[req.params["proto"]]}.txt`);
            let fbody = req.body;
            fs.writeFileSync(fpath, fbody);
            res.status(200)
            res.send("PROXY ARMADA\n¡piña colada!\nboxy tostada\ndusty piñata");
          } catch(e) {
            res.status(500);
            res.send(e.message);
          }
        })
        
        app.get('/proxies/:proto.txt', (req, res) => {
            const output = data.getProxyList(req.params["proto"]);
            res.set('Content-Type', 'text/plain')
            res.send(output.join("\n"));
        });

        app.ws('/info', function(ws, req) {
            ws.send(JSON.stringify(summary));
            listeners.push(ws);

            ws.on('close', function() {
                if (listeners.length === 1) {
                    listeners = [];
                } else {
                    const index = listeners.indexOf(ws);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            });
        });

        app.listen(port, () => console.log(`Started Express: http://localhost:${port}/`));
        info(data);
    }

    express(6660);
  }

  function info(data){
    summary = data.getSummary();
    setInterval(function() {
        let output = data.getSummary();
        if (output.timestamp !== summary.timestamp) {
            summary = output;
            for (const ws of listeners) {
                ws.send(JSON.stringify(summary));
            }
        }
    }, 15000);
  }

  function runArmada(mode){
    return new Promise(resolve=>{
      const { spawn } = require("node:child_process");
      let yarn = spawn("yarn", [`armada-${mode}`]);
      yarn.on('close', (code) => {
        console.log(`armada: exited, code ${code}`);
        resolve();
      });
    }) 
  }

  function setupCron(){
    const schedule = require("node-schedule");
    const job = schedule.scheduleJob("*/30 * * * *", function(){ 
      console.log(new Date().toJSON(), "Armada scheduled run started.")

      runArmada("cron").then(function(){
        console.log(new Date().toJSON(), "Armada scheduled run completed.")
      })
    })
    console.log("Scheduled armada to provide fresh proxy hourly.");
  }

  let listeners = [];
  let summary = {};

  startExpress();
  runArmada("start").then(setupCron);
}