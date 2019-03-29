/**
 * Imports
 */

// Inner
const jeffrey = require("../models/jeffrey.model");
const order = require("../models/order.model");

/**
 * Config
 */
exports.add = async event => {
  const { raw, rows } = await order.add(event.text, event.user);

  const result = await jeffrey.say({
    url: event.response_url,
    channel: event.channel,
    user: event.user,
    blocks: [
      {
        textKey: `addOrder_${raw.types.length}`,
        data: raw.data
      }
    ],
    error: !rows
  });

  order.prune();

  return !!rows;
};
