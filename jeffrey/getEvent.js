/**
 * Get an event object from payload
 * @param {object} payload - action payload
 * @param {string} text - optional text
 * @param {object} - event object
 */
const getEvent = (payload, text = "") => {
  return {
    type: payload.type,
    user: payload.user.id,
    channel: payload.channel.id,
    text
  };
};

/**
 * Export
 */
module.exports = getEvent;
