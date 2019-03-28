/**
 * Get current action
 * @param {object} payload - action payload
 * @return {string} - found action
 */
const getAction = payload => {
  const action = payload.actions[0];
  if (action.value) {
    return action.value;
  } else if (action.type === "static_select") {
    return action.selected_option.value;
  }
  return "";
};

/**
 * Export
 */
module.exports = getAction;
