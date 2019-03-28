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
    slackRouter.post("/event", slackController.verify, slackController.event);
    slackRouter.post("/action", slackController.verify, slackController.action);
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
