/**
 * Import
 */
const jeffrey = require("../models/jeffrey.model");

/**
 * Config
 */
exports.mention = async event => {
  const mentionMsg = Math.floor(Math.random() * 3) + 1;
  const mentionImg = Math.floor(Math.random() * 3) + 1;
  const result = await jeffrey.say({
    channel: event.channel,
    user: event.user,
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
        key: "mention_buttons"
      }
    ]
  });

  return result;
};
