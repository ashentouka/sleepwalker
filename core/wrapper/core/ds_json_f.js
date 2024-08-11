{
    const path = require("path"),
        fs = require("fs");

    const json_f = function (json_path, default_data) {
        return {
            load() {
                if (fs.existsSync(json_path)) {
                    let text = fs.readFileSync(json_path, "utf8");
                    return JSON.parse(text);
                } else {
                    return default_data || {}
                }
            },
            save(data) {
                let text = (typeof data === "object") ? JSON.stringify(data, null, 2) : `${data}`;
                if (!fs.existsSync(data_dir)) fs.mkdirSync(data_dir, { recursive: true });
                fs.writeFileSync(json_path, text, { encoding: "utf8" });
            }
        }
    }

    let dfs = {};

    let data_dir = path.join(path.resolve(__dirname + "/../"), `data/`);


    function loadCache(url){
        return new Promise(resolve => {
            if (!dfs[url]) {
                let db = (dfs[url] = json_f(path.join(data_dir,`${url}.json`), {nulled:true}));
                let data = db.load();
                if (data.nulled) {
                    resolve()
                } else {
                    resolve(data);
                }
            } else {
                let db = dfs[url];
                resolve(db.load());
            }
        })
    }

    function updateCache(url,data){
        return new Promise(resolve => {
            dfs[url].save(data);
            resolve();
        });
    }

    module.exports = {
        loadCache,
        updateCache
    }
}