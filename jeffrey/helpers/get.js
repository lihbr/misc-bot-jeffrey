/**
 * Import
 */

// Inner
const is = require("../helpers/is");

/**
 * Config
 */

/**
 * Get an event object from request body
 * @param {object} body - express request body
 * @return {object} - event object
 */
const event = body => {
  const event = {};
  if (body.event) {
    // Slack event
    event.type = body.event.type;
    event.subtype = body.event.subtype || "";
    event.user =
      body.event.user ||
      (body.event.message && body.event.message.user) ||
      (body.event.previous_message && body.event.previous_message.user);
    event.channel = body.event.channel;
    event.text =
      body.event.text ||
      (body.event.message && body.event.message.text) ||
      (body.event.previous_message && body.event.previous_message.text);
    event.ts = body.event.ts;
    event.blocks = [];
    event.actions = [];
    event.response_url = "";
  } else if (body.payload) {
    // Slack interaction
    const payload = JSON.parse(body.payload);

    const currentActions = actions(payload);

    event.type = payload.type;
    event.subtype = "";
    event.user = payload.user.id;
    event.channel = payload.channel.id;
    event.text = currentActions[0] || "";
    event.ts = payload.container.message_ts;
    event.blocks = payload.message.blocks;
    event.actions = currentActions;
    event.response_url = payload.response_url || "";
  } else if (body.command) {
    // Slack command
    event.type = "command";
    event.subtype = body.command.slice(1);
    event.user = body.user_id;
    event.channel = body.channel_id;
    event.text = body.text;
    event.ts = "";
    event.blocks = [];
    event.actions = [];
    event.response_url = body.response_url;
  }

  if (event.type && !event.subtype) {
    if (is.order(event.text)) {
      event.subtype = "addOrder";
    } else if (event.text) {
      event.subtype = event.text;
    }
  }

  return event;
};

/**
 * Get actions from payload
 * @param {object} payload - interactive object
 * @return {array} - actions value
 */
const actions = payload => {
  const actions = [];

  for (const action of payload.actions) {
    if (action.value) {
      actions.push(action.value);
    } else if (action.selected_option) {
      actions.push(action.selected_option.value);
    }
  }

  return actions;
};

/**
 * Export
 */
module.exports = {
  event,
  actions
};
