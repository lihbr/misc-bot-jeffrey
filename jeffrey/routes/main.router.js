/**
 * Imports
 */

// Inner
const Router = require("../core/Router.js");

const orderController = require("../controllers/order.ctrl");
const messageController = require("../controllers/message.ctrl");
const balanceController = require("../controllers/balance.ctrl");

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
    this.use("block_actions", "stats", orderController.stats);
    this.use("block_actions", "balance", balanceController.check);
    this.use("block_actions", "addOrder", orderController.add);
    // this.use("block_actions", "refill", balanceController.refill);

    this.use("command", "jeffreyhelp", messageController.help);
    this.use("command", "jeffreystats", orderController.stats, "dm");
    this.use("command", "jeffreybalance", balanceController.check);
    // this.use("command", "jeffreyrefill", balanceController.refill);
    this.use("command", "jeffreyupdate", messageController.updateUser);
    this.use("command", "jeffreycancel", orderController.cancel);

    // this.use("lydia", "payment", balanceController.payment);
  }
}

/**
 * Export
 */
module.exports = MainRouterClass;
