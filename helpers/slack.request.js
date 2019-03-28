/**
 * Import
 */
const crypto = require("crypto");

/**
 * Verify that the request comes from slack
 * @param {object} req - the request object
 * @return {boolean} - true if from slack
 */
exports.isFrom = req => {
  if (
    !req ||
    !req.headers["x-slack-request-timestamp"] ||
    !req.headers["x-slack-signature"]
  ) {
    return false;
  }

  const ver = "v0";
  const timestamp = req.headers["x-slack-request-timestamp"];

  const body = req.rawBody;

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
