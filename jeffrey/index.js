/**
 * Imports
 */

// Inner
const MainRouterClass = require("./routes/main.router.js");

// Helpers
const get = require("./helpers/get");

/**
 * Config
 */

/**
 * Redirect from express to jeffrey
 * @param {object} req - express request
 * @param {object} res - express response
 */
const redirect = (req, res) => {
  route(get.event(req.body));
};

/**
 * Redirect lydia payment from express to jeffrey
 * @param {object} req - express request
 * @param {object} res - express response
 */
const payment = (req, res) => {
  console.log(req.body);
  const event = {
    type: "lydia",
    subtype: "payment",
    user: req.params.tid.split("_")[0],
    channel: "dm",
    text: req.body.amount,
    ts: "",
    blocks: [],
    response_url: ""
  };

  route(event);
};

/**
 * Route an event object
 * @param {object} event - an event object
 * @return {any} - routing result
 */
const route = event => {
  console.log("");
  console.log("");
  console.log("NEW REQUEST");
  console.log("");
  console.log("");
  console.log(event);

  return new MainRouterClass().route(event);
};

/**
 * Export
 */
module.exports = {
  redirect,
  payment
};
