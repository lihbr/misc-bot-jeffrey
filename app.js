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

class AppClass {
  init() {
    app.use(compression());
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // NOTE: tests can't find the views directory without this
    app.set("views", path.join(__dirname, "views"));

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
