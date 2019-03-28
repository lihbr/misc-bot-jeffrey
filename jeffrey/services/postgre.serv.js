/**
 * Imports
 */

// Node
const { Pool } = require("pg");

/**
 * Config
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// If error
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Simple query
 * @param {string} text - query text
 * @param {array} params - query params
 */
exports.query = (text, params) => pool.query(text, params);

exports.end = () => pool.end();
