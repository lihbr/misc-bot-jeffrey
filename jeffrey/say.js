/**
 * Imports
 */
// Node
const axios = require("axios");
const _ = require("lodash/object");

// Inner
const jeffreyText = require("./text.json");
const jeffreyBlock = require("./block.json");

/**
 * Config
 */
axios.defaults.headers.common["Authorization"] = `Bearer ${
  process.env.SLACK_BOT_OAUTH_TOKEN
}`;

/**
 * Get text from the json
 * @param {string} key - text key
 * @param {boolean} error - error version if true
 * @return {string} - the text from the json
 */
const getText = (key, error) => {
  return error ? jeffreyText.error[key] : jeffreyText[key];
};

/**
 * Format blocks array
 * @param {object} event - slack event object
 * @param {array} unformatedBlocks - unformated blocks array
 * @param {boolean} error - error version if true
 * @return {array} - string with data inserted
 */
const formatBlocks = (event, unformatedBlocks, error) => {
  const blocks = [];

  for (const unformatedBlock of unformatedBlocks) {
    let block = {};

    if (unformatedBlock.textKey) {
      block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: insertData(
            event,
            getText(unformatedBlock.textKey, error),
            unformatedBlock.data
          )
        }
      };
    } else {
      block = jeffreyBlock[unformatedBlock.key];
      if (block.__inserts) {
        for (const insert of block.__inserts) {
          _.set(
            block,
            insert,
            insertData(event, _.get(block, insert), unformatedBlock.data)
          );
        }
        _.unset(block, "__inserts");
      }
    }

    blocks.push(block);
  }

  return blocks;
};

/**
 * Insert data into string
 * @param {object} event - slack event object
 * @param {string} string - string where to insert
 * @param {object} data - data to insert
 * @return {string} - string with data inserted
 */
const insertData = (event, string, data = {}) => {
  if (!string) return "";
  // Replace @author occurences
  string = string.replace(/@author/gi, `<@${event.user}>`);
  // Replace occurences of data with their values
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      string = string.replace(new RegExp(`#${key}#`, "gi"), element);
    }
  }

  return string;
};

/**
 * Make Jeffrey say something
 * @param {object} event - slack event object
 * @param {string} channel - channel id to post to (overwrite)
 * @param {object} text - the message text key
 * @param {object} blocks - slack blocks message
 * @param {boolean} error - send error message if true
 * @return {object} - axios response
 */
const say = async ({
  event,
  channel = null,
  text = {},
  blocks = [],
  error = false
} = {}) => {
  const trueChannel = channel || event.channel;

  const formatedText = insertData(event, getText(text.key, error), text.data);

  const formatedBlocks = formatBlocks(event, blocks, error);

  return await sendMessage(trueChannel, formatedText, formatedBlocks);
};

/**
 * Send message to slack
 * @param {string} channel - the channel to send
 * @param {string} text - text to send
 * @param {object} blocks - blocks to send
 * @return {object} - axios response
 */
const sendMessage = async (channel, text, blocks) => {
  return await axios.post(`${process.env.SLACK_API}/chat.postMessage`, {
    channel,
    text,
    blocks
  });
};

/**
 * Export
 */
module.exports = say;
