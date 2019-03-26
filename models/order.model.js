/**
 * Import
 */

// Node
const format = require("pg-format");

// Inner
const db = require("../services/postgre.serv");

const jeffreyConfig = require("../helpers/jeffrey.config.json");

/**
 * Add an order
 * @param {object} order - order object from jeffrey.isOrder()
 * @param {string} user - order author
 * @return {boolean|object} - false of created rows
 */
exports.add = async (order, user) => {
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
 * Prune orders older than 30 days
 * @return {integer} - number of row deleted
 */
exports.prune = async () => {
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
