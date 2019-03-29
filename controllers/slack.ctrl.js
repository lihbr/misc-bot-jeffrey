/**
 * Imports
 */

// Node
const md5 = require("md5");

// Inner

// Helpers
const slack = require("../helpers/slack.request");
const { response } = require("../helpers/response.format");

// Jeffrey
const jeffrey = require("../jeffrey/index");

/**
 * Config
 */

/**
 * Verify
 */
exports.verify = (req, res, next) => {
  addLog(req);
  // Send back challenge if any
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  // If request is from slack
  if (!slack.isFrom(req)) {
    return response.error({ res, status: 401, msg: "unauthorized" });
  }

  // Tell slack everything's ok
  if (req.body.command) {
    res.status(200).json({ response_type: "ephemeral", text: "Processing..." });
  } else {
    res.sendStatus(200);
  }

  // Deal with request duplication
  const md5Body = md5(JSON.stringify(req.body.event || req.body));
  if (history.includes(md5Body)) {
    return; // Already processed
  }

  history.push(md5Body);
  next();
};

/**
 * Index
 */
exports.toJeffrey = (req, res) => {
  const result = jeffrey.redirect(req, res);
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
  log = req.body;
};

let log = {};
let history = [];
