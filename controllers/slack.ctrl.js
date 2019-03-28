/**
 * Imports
 */

// Node
const md5 = require("md5");

// Inner

// Models
const order = require("../models/order.model");

// Helpers
const slack = require("../helpers/request.checkers");
const { response } = require("../helpers/response.format");

const jeffrey = require("../jeffrey/index");

/**
 * Config
 */

/**
 * Verify
 */
exports.verify = (req, res, next) => {
  // Send back challenge is any
  if (req.body.challenge) {
    return res.send(req.body.challenge);
  }

  // If request is from slack
  if (!slack.isFrom(req)) {
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
 * Handle slack event
 */
exports.event = async (req, res) => {
  // Add request to log
  addLog(req.body);

  const event = req.body.event;

  if (slack.isMessage(req, true)) {
    const thisOrder = order.getFromMsg(event.text);
    if (thisOrder.isOrder) {
      const addOrder = await order.add(thisOrder, event);
    }
  } else if (slack.isMention(req)) {
    const mentionMsg = Math.floor(Math.random() * 3) + 1;
    const mentionImg = Math.floor(Math.random() * 3) + 1;
    await jeffrey.say({
      event,
      blocks: [
        {
          textKey: `appMention_${mentionMsg}`
        },
        {
          key: "image",
          data: {
            url: `${process.env.API_URL}/assets/jeffrey${mentionImg}_small.gif`,
            name: "Jeffrey gif"
          }
        },
        {
          key: "mention_help"
        }
      ]
    });
  }
};

/**
 * Handle slack action
 */
exports.action = async (req, res) => {
  // Parse payload
  req.body.payload = JSON.parse(req.body.payload);

  // Add request to log
  addLog(req.body.payload);

  const payload = req.body.payload;

  if (slack.isBlockAction(req)) {
    const action = jeffrey.getAction(payload);
    const event = jeffrey.getEvent(payload, action);
    // Add order case
    if (action.indexOf("addOrder") === 0) {
      const thisOrder = order.getFromMsg(event.text);
      if (thisOrder.isOrder) {
        const addOrder = await order.add(thisOrder, event);
      }
    }
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
const addLog = data => {
  log = data;
};

let log = {};
let history = [];
