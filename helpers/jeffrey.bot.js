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
 * Get text from the json
 * @param {string} key - text key
 * @param {boolean} error - error message if true
 * @return {string} - the text from the json
 */
const getText = (key, error) => {
  return error ? jeffreyText.error[key] : jeffreyText[key];
};

/**
 * Format text with variables
 * @param {object} event - slack event object
 * @param {string} text - text from the json
 * @param {object} data - dynamic data to replace
 * @return {string} - formated text
 */
const formatText = (event, text, data) => {
  // Format @author occurences
  text = text.replace(/@author/gi, `<@${event.user}>`);
  // Replace occurences of data with their values
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      text = text.replace(new RegExp(`#${key}#`, "gi"), element);
    }
  }

  return text;
};

/**
 * Send message to slack
 * @param {string} text - the text to send
 * @param {string} channel - the channel to send
 * @return {object} - axios response
 */
const sendMessage = async (text, channel) => {
  return await axios.post(`${process.env.SLACK_API}/chat.postMessage`, {
    text,
    channel
  });
};

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
 * @param {object} event - slack event object
 * @param {string} textKey - the message text key
 * @param {string} channel - channel id to post to
 * @param {object} data - dynamic data to replace
 * @param {boolean} error - send error message if true
 * @return {object} - axios response
 */
exports.say = async ({
  event,
  textKey,
  channel = null,
  data = {},
  error = false
} = {}) => {
  const trueChannel = channel || event.channel;

  const text = formatText(event, getText(textKey, error), data);

  return await sendMessage(text, trueChannel);
};
