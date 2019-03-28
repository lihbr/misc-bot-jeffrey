/**
 * Import
 */

// Inner
const options = require("../options");

/**
 * Config
 */

/**
 * Check if text is an order
 * @param {string} text - text to check
 * @return {boolean} - true if found
 */
const order = text => {
  for (const key of options.config.orderKeys) {
    if (text.includes(key)) {
      return true;
    }
  }
  return false;
};

/**
 * Export
 */
module.exports = {
  order
};
