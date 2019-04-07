/**
 * Imports
 */

// Node
const axios = require("../core/axios");
const qs = require("qs");

// Inner
const options = require("../options");

/**
 * Config
 */

/**
 * Send a Lydia payment request
 * @param {integer} amount - amount of balance token
 * @param {string} cost - real cost
 * @param {string} user - user id
 * @param {string} phone - user phone
 * @return {string|boolean} - user profile or false
 */
const request = async ({ amount, cost, user, phone }) => {
  try {
    const req = {
      message: `Refill your Jeffrey balance by ${amount}~`,
      amount: cost,
      currency: "EUR",
      type: "phone",
      recipient: phone,
      expire_time: 14400, // 4 hours
      confirm_url: `${process.env.API_URL}/slack/payment/${user}_${Date.now()}`,
      user_token: process.env.LYDIA_USER_TOKEN
    };

    const { data } = await axios.post(
      `${process.env.LYDIA_API}/request/do.json`,
      qs.stringify(req),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log(data);

    return !(data.status && data.status === "error");
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Export
 */
module.exports = {
  request
};
