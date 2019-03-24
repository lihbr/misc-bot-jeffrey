/**
 * Imports
 */

// Inner

// Models
// const user = require("../models/user.model");

// Helpers
const { isFromSlack, isMessage } = require("../helpers/request.checkers");
const { isCoffee } = require("../helpers/jeffrey.checkers");
const { response } = require("../helpers/response.format");

/**
 * Config
 */

/**
 * Index
 */
exports.index = (req, res) => {
  log = {
    isFromSlack: isFromSlack(req),
    isMessage: isMessage(req),
    isCoffee: isCoffee(req),
    body: req.body,
    env: process.env
  };
  // If request is from slack
  if (!isFromSlack(req)) {
    return response.error({ res, status: 401, msg: "unauthorized" });
  }

  // If it's a user message
  if (isMessage(req)) {
    const event = req.body.event;

    if (isCoffee(event.text)) {
      response.success({ res, msg: "it's coffee!" });
    }
    return response.success({ res });
  }

  return response.error({ res, status: 400, msg: "bad request" });
};

/**
 * Log
 */
exports.log = (req, res) => {
  return response.success({
    res,
    msg: "current logs",
    data: log
  });
};

/**
 * Ephemeral in-memory data store
 */
let log = {};
