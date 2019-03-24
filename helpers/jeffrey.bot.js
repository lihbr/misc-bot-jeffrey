/**
 * Import
 */
const axios = require("axios");

axios.defaults.headers.common["Authorization"] = `Bearer ${
  process.env.SLACK_BOT_OAUTH_TOKEN
}`;

/**
 * Verify that the request is for coffee
 * @param {string} text - the message text
 * @return {boolean} - true is it's for coffee
 */
exports.isCoffee = text => {
  return /:café:|:coffee:/.test(text);
};

/**
 * Make Jeffrey say something
 * @param {string} text - the message text
 * @param {string} channel - channel id to post to
 * @return {object} - axios response
 */
exports.say = async (text, channel) => {
  return await axios.post(`${process.env.SLACK_API}/chat.postMessage`, {
    text,
    channel
  });
};
