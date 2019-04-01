/**
 * Import
 */

// Inner
const jeffrey = require("../models/jeffrey.model");
const user = require("../models/user.model");

const options = require("../options");

/**
 * Config
 */

/**
 * Answer to app_mention
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.mention = async event => {
  const mentionMsg = Math.floor(Math.random() * 3) + 1;
  const mentionImg = Math.floor(Math.random() * 3) + 1;
  const result = await jeffrey.say({
    channel: event.channel,
    user: event.user,
    blocks: [
      { textKey: `appMention_${mentionMsg}` },
      {
        key: "image",
        data: {
          url: `${process.env.API_URL}/assets/jeffrey${mentionImg}_small.gif`,
          name: "Jeffrey gif"
        }
      },
      { key: "mentionButtons" }
    ]
  });

  return result;
};

/**
 * Help anwser
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.help = async event => {
  const channel = await jeffrey.getDMChannel(event.user);

  const orderTypes = [];

  for (const type in options.config.orders) {
    if (options.config.orders.hasOwnProperty(type)) {
      const order = options.config.orders[type];
      orderTypes.push(
        `- ${order.emoji} \`${order.emoji}\` | value: *${order.value}*`
      );
    }
  }

  const [result, callback] = await Promise.all([
    jeffrey.say({
      channel,
      user: event.user,
      blocks: [
        { textKey: "helpIntro" },
        { key: "divider" },
        {
          textKey: "helpOrder",
          data: {
            orderTypes: orderTypes.join("\n")
          }
        },
        { key: "divider" },
        { textKey: "helpMention" },
        { key: "divider" },
        { textKey: "helpCommands" },
        { key: "divider" },
        { key: "info" }
      ]
    }),
    jeffrey.checkDM(event, channel)
  ]);

  return result;
};

/**
 * Balance answer
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.balance = async event => {
  const [author, channel] = await Promise.all([
    user.get(event.user),
    jeffrey.getDMChannel(event.user)
  ]);

  let textKey = "balanceOk";
  const data = {
    balance: author.balance || 0,
    plural: author.balance && author.balance > 1 ? "s" : ""
  };

  if (author.balance) {
    if (author.balance <= 0) {
      textKey = "warnBalanceNull";
    } else if (author.balance <= options.config.balance.warnArt) {
      textKey = "warnBalanceLow";
    }
  }

  console.log("___");
  console.log(author);
  console.log("___");

  const [result, callback] = await Promise.all([
    jeffrey.say({
      channel,
      user: event.user,
      blocks: [{ textKey, data }],
      error: !author.balance
    }),
    jeffrey.checkDM(event, channel)
  ]);

  return result;
};
