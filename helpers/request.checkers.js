/**
 * Import
 */
const crypto = require("crypto");

/**
 * Verify that the request comes from Slack
 * @param {object} req - the request object
 * @return {boolean} - true if from Slack
 */
exports.isFromSlack = req => {
  if (
    !req ||
    !req.headers["x-slack-request-timestamp"] ||
    !req.headers["x-slack-signature"]
  ) {
    return false;
  }

  const ver = "v0";
  const timestamp = req.headers["x-slack-request-timestamp"];
  const body = JSON.stringify(req.body);

  // If too old
  if (
    process.env.NODE_ENV === "production" &&
    Date.now() / 1000 - timestamp > 60 * 5
  ) {
    return false;
  }

  const basestring = `${ver}:${timestamp}:${body}`;

  const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);

  hmac.update(basestring);

  const signature = `${ver}=${hmac.digest("hex")}`;

  return signature === req.headers["x-slack-signature"];
};

/**
 * Verify that the request is a user message
 * @param {object} req - the request object
 * @return {boolean}
 */
exports.isMessage = req => {
  if (!req.body || !req.body.event || !req.body.event.type) return false;
  return req.body.event.type === "message";
};
