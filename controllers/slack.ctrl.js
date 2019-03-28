/**
 * Imports
 */

// Node
const md5 = require("md5");

// Inner

// Models
const order = require("../models/order.model");

// Helpers
const {
  isFromSlack,
  isMessage,
  isMention
} = require("../helpers/request.checkers");
const jeffrey = require("../helpers/jeffrey.bot");
const { response } = require("../helpers/response.format");

/**
 * Config
 */

/**
 * Verify
 */
exports.verify = (req, res, next) => {
  // Add request to log
  addLog(req);

  // Send back challenge is any
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  // If request is from slack
  if (!isFromSlack(req)) {
    return response.error({ res, status: 401, msg: "unauthorized" });
  }

  // Tell slack everything's ok
  res.sendStatus(200);

  // Deal with request duplication
  const md5Body = md5(JSON.stringify(req.body.event || req.body));
  if (history.includes(md5Body)) {
    return; // Already processed
  }

  history.push(md5Body);
  next();
};

/**
 * Index
 */
exports.index = async (req, res) => {
  const event = req.body.event;
  // If it's a user message
  if (isMessage(req, true)) {
    const thisOrder = jeffrey.getOrder(event.text);
    if (thisOrder.isOrder) {
      const addOrder = await order.add(thisOrder, event.user);

      await jeffrey.say({
        event,
        textKey: `addOrder_${thisOrder.types.length}`,
        data: thisOrder.data,
        error: !addOrder
      });

      const prune = await order.prune();
    }
  } else if (isMention(req)) {
    const mentionMsg = Math.floor(Math.random() * 3) + 1;
    const mentionImg = Math.floor(Math.random() * 3) + 1;
    await jeffrey.say({
      event,
      textKey: `appMention_${mentionMsg}`,
      attachments: [
        {
          fallback: "Jeffrey gif",
          image_url: `${process.env.API_URL}/assets/jeffrey${mentionImg}.gif`
        }
      ]
    });
  }
};

/**
 * Log
 */
exports.log = (req, res) => {
  return response.success({
    res,
    msg: "current logs",
    data: log
  });
};

/**
 * Ephemeral in-memory data store
 */
const addLog = req => {
  log = {
    body: req.body
  };
};

let log = {};
let history = [];
