/**
 * Imports
 */

// Express
const { Router } = require("express");

// Inner
const SlackRouterClass = require("./slack.router");

/**
 * Config
 */

// Parent
const mainRouter = Router();

// Child
const slackRouter = new SlackRouterClass();

// Genealogy
mainRouter.use("/slack", slackRouter.init());

/**
 * Export
 */

module.exports = mainRouter;
