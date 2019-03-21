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
 * Create
 */
exports.ping = (req, res, next) => {
  return response.success({ res, msg: "pong!" });
};
