/**
 * Import
 */

// Inner
const jeffrey = require("../jeffrey/index");

/**
 * Response to mention
 * @param {object} event - slack event object
 */
const response = async event => {
  const mentionMsg = Math.floor(Math.random() * 3) + 1;
  const mentionImg = Math.floor(Math.random() * 3) + 1;
  await jeffrey.say({
    event,
    blocks: [
      {
        textKey: `appMention_${mentionMsg}`
      },
      {
        key: "image",
        data: {
          url: `${process.env.API_URL}/assets/jeffrey${mentionImg}_small.gif`,
          name: "Jeffrey gif"
        }
      },
      {
        key: "mention_help"
      }
    ]
  });
};

/**
 * Export
 */
module.exports = { response };
