/**
 * Import
 */

/**
 * Verify that the request is for coffee
 * @param {string} text - the message text
 * @return {boolean} - true is it's for coffee
 */
exports.isCoffee = text => {
  return /:café:|:coffee:/.test(text);
};
