/**
 * Imports
 */

// Node
const format = require("pg-format");

// Inner
const db = require("../services/postgre.serv");

const options = require("../options");

/**
 * Add an order
 * @param {object} text - user text
 * @param {string} user - order author
 * @return {object} - order and created rows
 */
add = async (text, user) => {
  const order = getFromMsg(text);
  try {
    const values = [];

    const now = Date.now();

    for (const type of order.types) {
      values.push([
        user,
        type,
        order[type],
        options.config.values[type] * order[type],
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
 * get order from the request if it's an order
 * @param {string} text - the message text
 * @return {object} - order object
 */
const getFromMsg = text => {
  let types = [];

  const coffee = (text.match(/:coffee:/gi) || []).length;
  coffee && types.push("coffee");

  const chocolate = (text.match(/:chocolate_bar:/gi) || []).length;
  chocolate && types.push("chocolate");

  const tea = (text.match(/:tea:/gi) || []).length;
  tea && types.push("tea");

  const order = {
    isOrder: !!types.length,
    types,
    coffee,
    chocolate,
    tea,
    data: {}
  };

  // Build data
  for (let i = 0; i < types.length; i++) {
    order.data[`num_${i + 1}`] = order[types[i]];
    order.data[`type_${i + 1}`] = types[i];
    order.data[`plural_${i + 1}`] = order[types[i]] > 1 ? "s" : "";
  }

  return order;
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
  prune
};
