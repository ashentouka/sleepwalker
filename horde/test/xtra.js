{

    const express = require('express'),

    const app = express();
    app.use("/", express.static(path.join(__dirname, "../xtra/plausible-referrer/test/")));

    let port = 7770;
    app.listen(port, () => console.log(`Started Harness: http://localhost:${port}/`));
    
}