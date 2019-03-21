/**
 * Imports
 */

// Node
const path = require("path");

// Express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");

// AWS
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// Inner
const mainRouter = require("./routes/main.router");

/**
 * Config
 */

// Main
const app = express();

class AppClass {
  init() {
    app.set("view engine", "pug");

    app.use(compression());
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(awsServerlessExpressMiddleware.eventContext());

    // NOTE: tests can't find the views directory without this
    app.set("views", path.join(__dirname, "views"));

    app.use("/", mainRouter);
  }
  local(port = 3000) {
    this.init();

    app.listen(port, () => {
      console.log(`listening on http://localhost:${port}`);
    });
  }
  production() {
    this.init();
    return app;
  }
}

/**
 * Export
 */

// Export your express server so you can import it in the lambda function.
module.exports = AppClass;
