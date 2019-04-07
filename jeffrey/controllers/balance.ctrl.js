/**
 * Import
 */

// Inner
const jeffrey = require("../models/jeffrey.model");
const user = require("../models/user.model");
const lydia = require("../models/lydia.model");

const options = require("../options");

/**
 * Config
 */

/**
 * Check user balance
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.check = async event => {
  const [author, channel] = await Promise.all([
    user.get(event.user),
    jeffrey.getDMChannel(event.user)
  ]);

  const blocks = [{ textKey: "balanceOk" }];

  const success = author && channel;

  if (success) {
    blocks[0].data = {
      balance: author.balance,
      plural: author.balance > 1 ? "s" : ""
    };

    if (author.balance <= options.config.balance.warnAt) {
      console.log("oui");
      blocks[0].textKey = "warnBalanceLow";

      if (author.balance <= 0) {
        blocks[0].textKey = "warnBalanceNull";
      }

      blocks.push({ key: "refillNow" });
    } else {
      blocks.push({ key: "refillAnyway" });
    }
  }

  const [result, callback] = await Promise.all([
    jeffrey.say({
      channel,
      user: event.user,
      blocks,
      error: !success
    }),
    jeffrey.checkDM(event, channel)
  ]);

  return result;
};

/**
 * Refill user balance
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.refill = async event => {
  const [author, channel] = await Promise.all([
    user.getUpdated(event.user),
    jeffrey.getDMChannel(event.user)
  ]);

  const blocks = [{ textKey: "refillConfirm" }];

  let success = author && channel;

  if (success) {
    if (author.phone !== "") {
      const amount = isNaN(parseInt(event.text))
        ? options.config.default.refill.amount
        : parseInt(event.text);

      const cost = (amount * options.config.default.refill.value).toFixed(2);

      success = await lydia.request({
        amount,
        cost,
        user: author.uid,
        phone: author.phone
      });

      console.log(success);

      if (success) {
        blocks[0].data = {
          phone: author.phone,
          amount,
          cost
        };
        blocks.push({ key: "refillInfo" });
      }
    } else {
      blocks[0].textKey = "refillNoNumber";
      blocks.push({ key: "refillTryAgain" });
    }
  }

  const result = await Promise.all([
    jeffrey.say({
      channel,
      url: channel === event.channel ? event.response_url : "",
      user: event.user,
      blocks,
      error: !success
    }),
    jeffrey.checkDM(event, channel)
  ]);

  return success;
};

/**
 * Receiving a payment from Lydia
 * @param {object} event - event object
 * @return {object} - axios response
 */
exports.payment = async event => {
  const [author, channel] = await Promise.all([
    user.get(event.user),
    jeffrey.getDMChannel(even.user)
  ]);

  const blocks = [{ textKey: "refillSuccess" }];

  let success = author && channel;

  if (success) {
    author.balance += event.text;
    const update = await user.update(author);
    success = !!update;

    if (success) {
      blocks[0].data = {
        cost: (event.text * options.config.default.refill.value).toFixed(2),
        balance: update.balance
      };
    }
  }

  const result = await jeffrey.say({
    channel,
    user: event.user,
    blocks,
    error: !success
  });

  return success;
};
