/**
 * Import
 */

// Inner
const options = require("../options");

/**
 * Config
 */

/**
 * Normalize a phone number
 * @param {string} number - number to check
 * @return {string} - normalized phone number
 */
const normalizePhone = (number = "") => {
  return number.replace(/[^\d\+]/gi, "");
};

/**
 * ucfirst a string
 * @param {string} str - string to ucfirst
 * @return {string} - ucfirst string
 */
const ucFirst = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Export
 */
module.exports = {
  normalizePhone,
  ucFirst
};
