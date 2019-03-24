/**
 * Imports
 */

// Express
const { Router } = require("express");

// Inner
const SlackRouterClass = require("./slack.router");

const { response } = require("../helpers/response.format");

/**
 * Config
 */

// Parent
const mainRouter = Router();

// Child
const slackRouter = new SlackRouterClass();

// Genealogy
mainRouter.use("/slack", slackRouter.init());

// 404
mainRouter.use("*", (req, res) =>
  response.error({ res, status: 404, msg: "not found" })
);

/**
 * Export
 */

module.exports = mainRouter;
