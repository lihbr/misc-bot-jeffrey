/**
 * Imports
 */
const axios = require("axios");

// Inner
const jeffreyText = require("./jeffrey.text.json");

/**
 * Config
 */
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
 * @param {object} data - dynamic data to replace
 * @return {object} - axios response
 */
exports.say = async ({ text, event, channel = null, data = {} } = {}) => {
  const trueChannel = channel || event.channel;

  text = jeffreyText[text];

  // Format @author occurences
  text = text.replace(/@author/gi, `<@${event.user}>`);
  // Replace occurences of data with their values
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      text = text.replace(new RegExp(`@${key}`, "gi"), element);
    }
  }

  return await axios.post(`${process.env.SLACK_API}/chat.postMessage`, {
    text: ,
    channel: trueChannel
  });
};
