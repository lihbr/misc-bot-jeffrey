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
  const event = get.event(req.body);

  console.log("");
  console.log("");
  console.log("NEW REQUEST");
  console.log("");
  console.log("");
  console.log(event);

  const mainRouter = new MainRouterClass();

  return mainRouter.route(event);
};

/**
 * Export
 */
module.exports = {
  redirect
};
