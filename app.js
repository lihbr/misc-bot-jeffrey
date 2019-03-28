/**
 * Imports
 */

// Env
require("dotenv").config();

// Node
const path = require("path");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");

// Inner
const mainRouter = require("./routes/main.router");

/**
 * Config
 */

// Main
const app = express();

// Set rowBody correctly
const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

class AppClass {
  init() {
    app.use(compression());
    app.use(cors());
    app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
    app.use(bodyParser.json({ verify: rawBodyBuffer }));

    app.use(express.static(path.join(__dirname, "public")));

    app.use("/", mainRouter);
  }
  start(port = 3000) {
    this.init();

    app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
    });
  }
}

new AppClass().start(process.env.PORT || 3000);
