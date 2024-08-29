{
    const { client } = require("@sleepwalker/router").horde.simple;

    module.exports = {

        plaintext (path, source, cb) {
            let data;
            let method = "get";
            if (source.post) {
                data = source.post;
                method = "post"
            }
            client({ url: path, accept: "text", method, data, timeout: 10000 }).then(r=>cb(null,r.data)).catch(cb);
        }
    }
}
