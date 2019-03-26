/**
 * Imports
 */

// Node
const md5 = require("md5");

// Inner
const db = require("../services/postgre.serv");

// Models
const coffee = require("../models/coffee.model");

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
exports.index = async (req, res) => {
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
  const md5Body = md5(JSON.stringify(req.body.event || req.body));
  if (history.includes(md5Body)) {
    return; // Already processed
  } else {
    history.push(md5Body);
  }

  // If it's a user message
  if (isMessage(req, true)) {
    const event = req.body.event;

    let thisCoffee;
    if ((thisCoffee = jeffrey.isCoffee(event.text))) {
      const addCoffee = await coffee.add(event.user, thisCoffee);

      await jeffrey.say({
        event,
        textKey: "addCoffee",
        data: {
          coffee: thisCoffee,
          plural: thisCoffee > 1 ? "s" : ""
        },
        error: !addCoffee
      });

      await db.end();
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
    body: req.body
  };
};

let log = {};
let history = [];
