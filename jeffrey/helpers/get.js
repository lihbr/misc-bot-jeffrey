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
    event.text = body.event.text;
    event.blocks = [];
    event.actions = [];
  } else if (body.payload) {
    // Slack interaction
    const payload = JSON.parse(body.payload);

    const currentActions = actions(payload);

    event.type = payload.type;
    event.subtype = "";
    event.user = payload.user.id;
    event.channel = payload.channel.id;
    event.text = currentActions[0] || "";
    event.blocks = payload.message.blocks;
    event.actions = currentActions;
  }

  if (!event.subtype) {
    if (is.order(event.text)) {
      event.subtype = "addOrder";
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
