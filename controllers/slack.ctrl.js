/**
 * Imports
 */

// Node
const md5 = require("md5");

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
  // Add request to log
  addLog(req);

  // Send back challenge is any
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  // If request is from slack
  if (!isFromSlack(req)) {
    return response.error({ res, status: 401, msg: "unauthorized" });
  }

  // Tell slack everything's ok
  res.sendStatus(200);

  // Deal with request duplication
  // const md5Body = md5(JSON.stringify(req.body));
  // if (history.includes(md5Body)) {
  //   return;
  // } else {
  //   history.push(md5Body);
  // }

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
          plural: coffee > 1 ? "s" : ""
        }
      });
    }
  }
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
const addLog = req => {
  log = {
    isFromSlack: isFromSlack(req),
    isMessage: isMessage(req),
    isCoffee: jeffrey.isCoffee(req.body.event.text),
    body: req.body
  };
};

let log = {};
let history = [];
