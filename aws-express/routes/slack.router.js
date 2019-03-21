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
    slackRouter.post("/ping", slackController.ping);
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
