/**
 * Import
 */
const axios = require("axios");

/**
 * Config
 */
axios.defaults.headers.common["Authorization"] = `Bearer ${
  process.env.SLACK_BOT_OAUTH_TOKEN
}`;

/**
 * Export
 */
module.exports = axios;
