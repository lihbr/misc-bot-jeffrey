/**
 * Imports
 */

// Node
const format = require("pg-format");

// Inner
const db = require("../services/postgre.serv");

const jeffrey = require("../jeffrey/index");
const jeffreyConfig = require("../jeffrey/config.json");

/**
 * Add an order
 * @param {object} thisOrder - order object from order.getFromMsg()
 * @param {object} event - event object from slack
 * @return {boolean} - success if true
 */
const add = async (thisOrder, event) => {
  const addOrder = await addToDB(thisOrder, event.user);

  await jeffrey.say({
    event,
    blocks: [
      {
        textKey: `addOrder_${thisOrder.types.length}`,
        data: thisOrder.data
      }
    ],
    error: !addOrder
  });

  const pruned = await prune();

  return !addOrder;
};

/**
 * Add an order to DB
 * @param {object} order - order object from order.getFromMsg()
 * @param {string} user - order author
 * @return {boolean|object} - false of created rows
 */
addToDB = async (order, user) => {
  try {
    const values = [];

    const now = Date.now();

    for (const type of order.types) {
      values.push([
        user,
        type,
        order[type],
        jeffreyConfig.values[type] * order[type],
        now
      ]);
    }

    const { rows } = await db.query(
      format(
        "INSERT INTO orders (uid, type, amount, value, time) VALUES %L RETURNING *",
        values
      )
    );
    return rows;
  } catch (err) {
    console.error(err);
    return false;
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
 * Prune orders older than 30 days
 * @return {integer} - number of row deleted
 */
const prune = async () => {
  try {
    const now = Date.now();
    const month = 1000 * 60 * 60 * 24 * 30;
    const monthAgo = now - month;

    const result = await db.query("DELETE FROM orders WHERE time < $1", [
      monthAgo
    ]);

    return result.rowCount;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Export
 */
module.exports = {
  add,
  getFromMsg
};
