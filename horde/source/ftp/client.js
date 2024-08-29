{
    const ftp = require("basic-ftp-socks"); //, path = require("path"), fs = require("fs");
    const async = require("async");

    let poolsize = 10;

    function client ({ host, port, user, password, proxy }) {
		return new Promise((resolve, reject)=>{

	        //try {
	            //(async()=>{
                    let proxyparse = proxy.match(/(socks[45]?:\/\/)?(.*):(\d{2,5})/);

                    const client = new ftp.Client();
                    client.ftp.verbose = true;
/*                    if (callback) {
                        client.xclosex = client.close;
                        client.close = function(){
                            client.xclosex();
                            callback();
                        };
                    }*/
                    const connection = `ftp://${user}:${password}@${host}:${port}/`;
                    client.access({
    	                host,
    	                port: port || 21,
    	                user,
    	                password,
    	                secure: false,
    	                useSocksProxy: true,
    	                socksProxyHost: proxyparse[2],
    	                socksProxyPort: proxyparse[3]
    	            }).then(()=>resolve(client,connection)).catch(reject);
                //})()
	       /* } catch(ex) {
	        	reject(ex);
			} */
		})
	}             

    module.exports = {
        cluster({ threads }) {
            let queue = async.queue((task, callback) => {
                task(callback)
            }, threads || poolsize);
            
            let maintask;

            function callbackWrapper(mytask,callback) {
                return function innerWrapper(client) {
                    (async()=>{
                        await mytask(client);
                        callback();
                    })()
                }
            }

            return { 
                async task(f) {
                    maintask = f;
                    return
                },
                async queue(data, f) {
                    let mytask = f || maintask;
                    if (!mytask) throw new Error("no task defined, task should be specified by calling task(f) or as 2nd parameter to this method.");
                    queue.push(callback=>{
                        connex(data).then(callbackWrapper).catch(callback)
                    })
                    return
                },
                async execute(data, f) {
                    return new Promise(resolve=>{
                        let mytask = f || maintask || resolve;
                        queue.push(callback=>{
                            connex(data).then(callbackWrapper).catch(callback)
                        })
                    })
                },
                async idle() {
                    return new Promise(resolve=>{
                        queue.drain(function(){
                            resolve();
                        })
                    });
                },
                async close() {
                    queue.kill();
                    return
                }
            }
        },

        client
    }
}