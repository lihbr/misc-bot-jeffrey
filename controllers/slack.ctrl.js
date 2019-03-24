/**
 * Imports
 */

// Inner

// Models
// const user = require("../models/user.model");

// Helpers
const { isFromSlack, isMessage } = require("../helpers/request.checkers");
const jeffrey = require("../helpers/jeffrey.bot");
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
    isCoffee: jeffrey.isCoffee(req.body.event.text),
    body: req.body
  };
  // If request is from slack
  if (!isFromSlack(req)) {
    return response.error({ res, status: 401, msg: "unauthorized" });
  }

  // If it's a user message
  if (isMessage(req)) {
    const event = req.body.event;

    let coffee;
    if ((coffee = jeffrey.isCoffee(event.text))) {
      jeffrey.say({
        text: "addCoffee",
        event,
        data: {
          coffee,
          coffeePlural: coffee > 1 ? "s" : ""
        }
      });
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
