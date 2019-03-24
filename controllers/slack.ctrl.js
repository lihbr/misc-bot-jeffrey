/**
 * Imports
 */

// Inner

// Models
// const user = require("../models/user.model");

// Helpers
const { response } = require("../helpers/response.format");

/**
 * Config
 */

/**
 * Index
 */
exports.index = (req, res) => {
  log.push({ headers: req.headers, body: req.body });
  return res.json(req.body.challenge);
};

/**
 * Ping
 */
exports.ping = (req, res) => {
  return response.success({ res, msg: "pong!" });
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
const log = [];
