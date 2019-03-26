/**
 * Imports
 */

// Express
const { Router } = require("express");

// Inner
const slackController = require("../controllers/slack.ctrl.js");

/**
 * Config
 */

const slackRouter = Router();

class SlackRouterClass {
  routes() {
    slackRouter.post("/", slackController.verify, slackController.index);
    slackRouter.get("/log", slackController.log);
  }

  init() {
    this.routes();
    return slackRouter;
  }
}

/**
 * Export
 */

module.exports = SlackRouterClass;
