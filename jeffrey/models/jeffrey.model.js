/**
 * Imports
 */
// Node
const axios = require("axios");
const _ = require("lodash");

// Inner
const options = require("../options");

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
  return error ? options.text.error[key] : options.text[key];
};

/**
 * Format blocks array
 * @param {array} unformatedBlocks - unformated blocks array
 * @param {string} user - user id
 * @param {boolean} error - error version if true
 * @return {array} - string with data inserted
 */
const formatBlocks = (unformatedBlocks, user, error) => {
  const blocks = [];

  for (const unformatedBlock of unformatedBlocks) {
    let block = {};

    if (unformatedBlock.textKey) {
      // Simple text case
      block = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: insertData(
            getText(unformatedBlock.textKey, error),
            user,
            unformatedBlock.data
          )
        }
      };
    } else {
      // Other cases
      block = _.clone(options.block[unformatedBlock.key]);
      if (block.__inserts) {
        for (const insert of block.__inserts) {
          _.set(
            block,
            insert,
            insertData(_.get(block, insert), user, unformatedBlock.data)
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
 * @param {string} string - string where to insert
 * @param {object} user - user id
 * @param {object} data - data to insert
 * @return {string} - string with data inserted
 */
const insertData = (string, user, data = {}) => {
  if (!string) return "";
  // Replace @author occurences
  string = string.replace(/@author/gi, `<@${user}>`);
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
 * @param {string} channel - channel id to post to
 * @param {string} user - user id
 * @param {object} text - the message text key
 * @param {object} blocks - slack blocks message
 * @param {boolean} error - send error message if true
 * @return {object} - axios response
 */
const say = async ({
  channel,
  user = "",
  text = {},
  blocks = [],
  error = false
} = {}) => {
  const formatedText = insertData(getText(text.key, error), user, text.data);

  const formatedBlocks = formatBlocks(blocks, user, error);

  return await sendMessage(channel, formatedText, formatedBlocks);
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
module.exports = {
  say
};
