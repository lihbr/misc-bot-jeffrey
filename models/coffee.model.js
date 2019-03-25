/**
 * Import
 */

// Inner
const db = require("../services/postgre.serv");

/**
 * Add a coffee to a user
 * @param {string} uid - slack user
 * @param {integer} value - coffee value
 * @return {boolean|object} - false of created row
 */
exports.add = async (uid, value) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO coffee (uid, value, time) VALUES ($1, $2, $3) RETURNING *",
      [uid, value, Date.now()]
    );
    return rows[0];
  } catch (err) {
    console.error(err);
    return false;
  }
};
