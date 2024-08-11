 {
     const express = port=>{
        const express = require('express');
        const path = require("path");
        const app = express();

        app.use("/", express.static(path.join(__dirname, "/static"))); 
        app.listen(port, () => console.log(`Started Express: http://localhost:${port}/`));
    }

    express(8666);
  }