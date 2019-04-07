/**
 * Import
 */

// Inner
const is = require("../helpers/is");

const options = require("../options");

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
 * Transform an orders array into object
 * @param {array} array - an orders array
 * @return {object} - an orders object
 */
const ordersObject = array => {
  const obj = { total: 0 };

  for (const key in options.config.orders) {
    if (options.config.orders.hasOwnProperty(key)) {
      const item = array.find(i => i.type === key);
      obj[key] = item ? parseInt(item.total) : 0;
      obj.total += item ? parseInt(item.total) : 0;
    }
  }

  return obj;
};

/**
 * Get detail from an order object
 * @param {object} obj - order object
 * @return {string} - detailed string
 */
const detail = obj => {
  const d = [];

  for (const key in options.config.orders) {
    if (options.config.orders.hasOwnProperty(key)) {
      const el = obj[key] || 0;
      d.push(
        `- ${options.config.orders[key].emoji} ${key}${
          el > 1 ? "s" : ""
        } \`${el}\``
      );
    }
  }

  return d.join("\n");
};

/**
 * Get a top field for given key from users order array
 * @param {array} users - users order array
 * @param {string} key - key to top from
 * @param {string} intro - intro text
 * @param {string} outro - outro text
 * @param {integer} limit - top limit
 * @return {object} - field
 */
const top = ({ users, key, intro = "", outro = "", limit = 5 } = {}) => {
  const sorted = users.filter(i => i[key]).sort((a, b) => a[key] < b[key]);
  const t = intro ? [intro] : [];

  for (let i = 0; i < sorted.length && i < limit; i++) {
    if (sorted[i][key] > 0) {
      t.push(
        `${i + 1}. <https://${process.env.SLACK_WORKSPACE}.slack.com/messages/${
          sorted[i].uid
        }|${sorted[i].name}> \`${sorted[i][key]}\``
      );
    } else if (i === 0) {
      break;
    }
  }

  if ((intro && t.length === 1) || !t.length) {
    t.push(`No one's drinking ${key} yet~`);
  }

  outro && t.push(outro);

  return { type: "mrkdwn", text: t.join("\n") };
};

/**
 * Export
 */
module.exports = {
  event,
  actions,
  ordersObject,
  detail,
  top
};
