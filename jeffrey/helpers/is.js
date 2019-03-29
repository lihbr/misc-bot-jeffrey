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
  for (const type in options.config.orders) {
    if (options.config.orders.hasOwnProperty(type)) {
      const emoji = options.config.orders[type].emoji;
      if (text.includes(emoji)) {
        return true;
      }
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
