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
 * @return {integer} - number of coffee
 */
exports.isCoffee = text => {
  return (text.match(/:café:|:coffee:/gi) || []).length;
};

/**
 * Make Jeffrey say something
 * @param {string} text - the message text
 * @param {object} event - slack event object
 * @param {string} channel - channel id to post to
 * @return {object} - axios response
 */
exports.say = async (text, event, channel = null) => {
  const trueChannel = channel || event.channel;

  // Format @author occurences
  text = text.replace(/@author/gi, `<@${event.user}>`);

  return await axios.post(`${process.env.SLACK_API}/chat.postMessage`, {
    text,
    channel: trueChannel
  });
};
