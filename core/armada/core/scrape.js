{
    const { simple } = require("@sleepwalker/horde");

    module.exports = {

        plaintext (path, source, cb) {
            let data;
            let method = "get";
            if (source.post) {
                data = source.post;
                method = "post"
            }
            simple({ url: path, accept: "text", method, data }).then(r=>cb(null,r.data)).catch(cb);
        }
    }
}
