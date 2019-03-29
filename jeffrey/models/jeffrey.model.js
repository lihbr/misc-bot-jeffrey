/**
 * Imports
 */

// Node
const axios = require("../core/axios");
const _ = require("lodash");

// Inner
const options = require("../options");

/**
 * Config
 */

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
  if (!string) return "`null`";
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
 * @param {string} url - response url
 * @param {string} channel - channel id to post to
 * @param {string} user - user id
 * @param {object} text - the message text key
 * @param {object} blocks - slack blocks message
 * @param {boolean} error - send error message if true
 * @return {object} - axios response
 */
const say = async ({
  url = "",
  channel,
  user = "",
  text = {},
  blocks = [],
  error = false
} = {}) => {
  const formatedText = insertData(getText(text.key, error), user, text.data);

  const formatedBlocks = formatBlocks(blocks, user, error);

  if (channel === "dm") {
    channel = await getDMChannel(user);
  }

  if (!channel) return { ok: false };

  return await sendMessage(url, channel, formatedText, formatedBlocks);
};

/**
 * Send message to slack
 * @param {string} url - response url
 * @param {string} channel - the channel to send
 * @param {string} text - text to send
 * @param {object} blocks - blocks to send
 * @return {object} - axios response
 */
const sendMessage = async (url = false, channel, text, blocks) => {
  try {
    if (!url) url = `${process.env.SLACK_API}/chat.postMessage`;

    const { data } = await axios.post(url, {
      channel,
      text,
      blocks
    });

    return data;
  } catch (err) {
    console.error(err);
    return { ok: false };
  }
};

/**
 * Get user dm channel
 * @param {string} user - user id
 * @return {string|boolean} - channel id or false
 */
const getDMChannel = async user => {
  try {
    const { data } = await axios.post(`${process.env.SLACK_API}/im.open`, {
      user,
      include_locale: true
    });

    return !data.ok || data.channel.id;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Delete a message
 * @param {string} channel - channel where the message is
 * @param {string} ts - message ts
 */
const del = async (channel, ts) => {
  try {
    const { data } = await axios.post(`${process.env.SLACK_API}/chat.delete`, {
      channel,
      ts
    });
    return data.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Export
 */
module.exports = {
  say,
  del,
  getDMChannel
};
