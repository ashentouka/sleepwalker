{
    const path = require("path"),
        fs = require("fs");

    const json_f = function (json_path, default_data) {
        let is_default = true;

        function check_dir() {
            let dir_path = json_path.substr(0, json_path.lastIndexOf("/"));
            if (!fs.existsSync(dir_path)) fs.mkdirSync(dir_path, {recursive: true});
        }

        return {
            load() {
                check_dir()
                if (fs.existsSync(json_path)) {
                    let text = fs.readFileSync(json_path, "utf8");
                    is_default = false;
                    return JSON.parse(text);
                } else {
                    return default_data || {}
                }
            },
            save(data) {
                check_dir()
                let text = (typeof data === "object") ? JSON.stringify(data, null, 2) : `${data}`;
                fs.writeFileSync(json_path, text, {encoding: "utf8"});
            },
            delete() {
                is_default = true;
                if (fs.existsSync(json_path)) fs.unlinkSync(json_path);
            },
            isDefault() {
                return is_default
            }
        }
    }

    const txt_f = function (txt_path, default_data) {
        let is_default = true;

        function check_dir() {
            let dir_path = txt_path.substr(0, txt_path.lastIndexOf("/"));
            if (!fs.existsSync(dir_path)) fs.mkdirSync(dir_path, {recursive: true});
        }

        return {
            load() {
                check_dir()
                if (fs.existsSync(txt_path)) {
                    let text = fs.readFileSync(txt_path, "utf8");
                    is_default = false;
                    let data = [];
                    let text_lines = text.split("\n");
                    for (let line_num in text_lines){
                        let ld = text_lines[line_num];
                        if (ld.trim()) {
                            data.push(ld.trim());
                        }
                    }
                    return data;
                } else {
                    return default_data || {}
                }
            },

            append(data) {
                check_dir()
                let line = (fs.existsSync(txt_path)) ? "\n" : "";
                fs.appendFileSync(txt_path, line + data, {encoding: "utf8"})
            },

            save(data) {
                check_dir()
                if (typeof data === "object" && data instanceof Array) {
                    let txt_file = "";
                    for (let line_num in data) {
                        txt_file += `${(line_num > 0) ? "\n" : ""}${data[line_num]}`;
                    }
                    fs.writeFileSync(txt_path, txt_file, {encoding: "utf-8"})
                } else {
                    fs.writeFileSync(txt_path, data, {encoding: "utf8"});
                }
            },
            delete() {
                is_default = true;
                if (fs.existsSync(txt_path)) fs.unlinkSync(txt_path);
            },
            isDefault() {
                return is_default
            }
        }
    }

    const JsonData = class {

        constructor(url, default_data) {
            this.sync = new JsonDataSync(url, default_data);
        }

        loadCache() {
            return new Promise(resolve => {
                resolve(this.sync.loadCache());
            })
        }

        updateCache(data) {
            return new Promise(resolve => {
                this.sync.updateCache(data);
                resolve();
            });
        }

        deleteCache() {
            return new Promise(resolve => {
                this.sync.deleteCache();
                resolve()
            })
        }
    }

    const ArrayData = class {

        constructor(url, default_data) {
            this.sync = new ArrayDataSync(url, default_data);
        }

        loadCache() {
            return new Promise(resolve => {
                resolve(this.sync.loadCache());
            })
        }

        updateCache(data) {
            return new Promise(resolve => {
                this.sync.updateCache(data);
                resolve();
            });
        }

        deleteCache() {
            return new Promise(resolve => {
                this.sync.deleteCache();
                resolve()
            })
        }
    }

    const JsonDataSync = class {
        constructor(url, default_data) {
            this.url = url;
            this.default_data = default_data;
            this.dfs = {};
        }

        loadCache() {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = json_f(path.resolve(`${this.url}.txt`), this.default_data)));
            let data = db.load();
            return (data);
        }

        updateCache(data) {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = json_f(path.resolve(`${this.url}.txt`), this.default_data)));
            db.save(data);
        }

        deleteCache() {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = json_f(path.resolve(`${this.url}.txt`), this.default_data)));
            db.delete()
            this.dfs[this.url] = undefined;

        }
    }

    const ArrayDataSync = class {
        constructor(url, default_data) {
            this.url = url;
            this.default_data = default_data;
            this.dfs = {};
        }

        loadCache() {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = txt_f(path.resolve(`${this.url}.txt`), this.default_data)));
            let data = db.load();
            return (data);
        }

        updateCache(data) {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = txt_f(path.resolve(`${this.url}.txt`), this.default_data)));
            db.save(data);
        }

        appendCache(data) {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = txt_f(path.resolve(`${this.url}.txt`), this.default_data)));
            db.append(data);
        }

        deleteCache() {
            let db = (this.dfs[this.url] || (this.dfs[this.url] = txt_f(path.resolve(`${this.url}.txt`), this.default_data)));
            db.delete()
            this.dfs[this.url] = undefined;
        }
    }


    module.exports = {
        JsonDataSync,
        JsonData,
        ArrayDataSync,
        ArrayData
    }
}