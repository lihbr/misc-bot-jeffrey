/**
 * Imports
 */

// Inner
const Router = require("../core/Router.js");

const orderController = require("../controllers/order.ctrl");
const messageController = require("../controllers/message.ctrl");

/**
 * Config
 */
class MainRouterClass extends Router {
  constructor() {
    super();

    this.routes();
  }

  routes() {
    this.use("message", "addOrder", orderController.add);

    this.use("app_mention", "*", messageController.mention);

    this.use("block_actions", "help", messageController.help);
    this.use("block_actions", "addOrder", orderController.add);
    this.use("block_actions", "stats", orderController.stats);

    this.use("command", "jeffreyhelp", messageController.help);
    this.use("command", "jeffreystats", orderController.stats, "dm");
  }
}

/**
 * Export
 */
module.exports = MainRouterClass;
