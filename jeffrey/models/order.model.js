/**
 * Imports
 */

// Node
const format = require("pg-format");

// Inner
const db = require("../services/postgre.serv");

const options = require("../options");

/**
 * Config
 */

/**
 * Add an order
 * @param {object} text - user text
 * @param {string} user - order author
 * @return {object} - order and created rows
 */
const add = async (text, user) => {
  const order = getFromMsg(text);
  try {
    const values = [];

    const now = Date.now();

    for (const type of order.types) {
      values.push([
        user,
        type,
        order[type],
        options.config.orders[type].value * order[type],
        now
      ]);
    }

    const { rows } = await db.query(
      format(
        "INSERT INTO orders (uid, type, amount, value, time) VALUES %L RETURNING *",
        values
      )
    );
    return { raw: order, rows };
  } catch (err) {
    console.error(err);
    return { raw: order, rows: false };
  }
};

/**
 * Get order from the request if it's an order
 * @param {string} text - the message text
 * @return {object} - order object
 */
const getFromMsg = text => {
  const types = [];

  const order = {};

  for (const type in options.config.orders) {
    if (options.config.orders.hasOwnProperty(type)) {
      const beverage = options.config.orders[type];
      const amount = (text.match(new RegExp(beverage.emoji, "gi")) || [])
        .length;

      order[type] = amount;
      amount && types.push(type);
    }
  }

  order.isOrder = !!types.length;
  order.types = types;
  order.data = {};

  // Build data
  for (let i = 0; i < types.length; i++) {
    order.data[`num_${i + 1}`] = order[types[i]];
    order.data[`type_${i + 1}`] = types[i];
    order.data[`plural_${i + 1}`] = order[types[i]] > 1 ? "s" : "";
  }

  return order;
};

/**
 * Get all order
 * @return {array} - all orders
 */
const getAll = async () => {
  try {
    const { rows } = await db.query(
      "SELECT type, SUM(amount) as total FROM orders GROUP BY type"
    );
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Get all order
 * @param {string} user - user id
 * @return {array} - all orders
 */
const getAllFromUser = async user => {
  try {
    const { rows } = await db.query(
      "SELECT type, SUM(amount) as total FROM orders WHERE uid = $1 GROUP BY type",
      [user]
    );
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Prune orders older than 30 days once a day
 * @return {integer} - number of row deleted
 */
const prune = async () => {
  try {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    const month = day * 30;

    if (lastPrune < now - day) {
      const result = await db.query("DELETE FROM orders WHERE time < $1", [
        now - month
      ]);

      lastPrune = now;

      return result.rowCount;
    }
    return 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

/**
 * Ephemeral in-memory data store
 */
let lastPrune = 0;

/**
 * Export
 */
module.exports = {
  add,
  getFromMsg,
  getAll,
  getAllFromUser,
  prune
};
