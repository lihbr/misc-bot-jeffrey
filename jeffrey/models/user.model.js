/**
 * Imports
 */

// Inner
const db = require("../services/postgre.serv");

const jeffrey = require("../models/jeffrey.model");

const options = require("../options");

/**
 * Config
 */

/**
 * Create a user
 * @param {string} user - user to create
 * @param {string} name - user's name
 * @param {string} phone - user's phone
 * @return {boolean|object} - user object or false if error
 */
const create = async (user, name = "", phone = "") => {
  try {
    const now = Date.now();
    const { rows } = await db.query(
      "INSERT INTO users (uid, balance, creation, name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING uid, balance, total, creation, name, phone",
      [user, options.config.default.user.balance, now, name, phone]
    );

    return rows[0] || false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Get a user
 * @param {string} user - user to get
 * @return {boolean|object} - user object or false if error
 */
const get = async user => {
  try {
    const { rows } = await db.query(
      "SELECT uid, balance, total, name, phone, creation FROM users WHERE uid = $1",
      [user]
    );

    if (!rows.length) {
      const info = await jeffrey.getUser(user);

      if (!info) {
        return false;
      }

      return await create(user, info.name, info.phone);
    }

    return rows[0] || false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Get all users
 * @return {array} - all users
 */
const getAll = async () => {
  try {
    const { rows } = await db.query(
      "SELECT uid, balance, total, name, phone, creation FROM users"
    );
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Update a user
 * @param {object} user - new user object
 * @return {boolean|object} - updated user object or false if error
 */
const update = async user => {
  try {
    const { rows } = await db.query(
      "UPDATE users SET balance = $1, total = $2, name = $3, phone = $4 WHERE uid = $5 RETURNING uid, balance, total, creation, name, phone",
      [user.balance, user.total, user.name, user.phone, user.uid]
    );

    return rows[0] || false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Get an updated user
 * @param {string} user - user id
 * @return {boolean|object} - updated user object or false if error
 */
const getUpdated = async user => {
  try {
    const info = await jeffrey.getUser(user);

    if (!info) {
      return false;
    }

    const { rows } = await db.query(
      "UPDATE users SET name = $1, phone = $2 WHERE uid = $3 RETURNING uid, balance, total, creation, name, phone",
      [info.name, info.phone, user]
    );

    if (!rows.length) {
      return await create(user, info.name, info.phone);
    }

    return rows[0] || false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Export
 */
module.exports = {
  create,
  get,
  getAll,
  update,
  getUpdated
};
