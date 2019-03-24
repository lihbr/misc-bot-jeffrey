/**
 * Format success and error properly
 */
// Quickly sanitize msg
const sanitizeMsg = msg => {
  msg = msg.replace(/\.$/, "");
  return msg.toLowerCase();
};

exports.response = {
  success: ({ res, status = 200, msg = "", data = null } = {}) => {
    msg = sanitizeMsg(msg);
    return res.status(status).json({ status, msg, data });
  },
  error: (
    { res, status = 500, msg = "", error = null } = {},
    trusted = false
  ) => {
    // Log error if not in production
    if (process.env.NODE_ENV !== "production" && error) console.log(error);

    // Get CouchDB error message & status if they exist
    if (error) {
      if (error.error && error.error.reason) msg = error.error.reason;
      if (error.statusCode) status = error.statusCode;
    }
    // Clear error details if source not trusted or production
    if (!trusted || process.env.NODE_ENV === "production") error = null;

    msg = sanitizeMsg(msg);
    return res.status(status).json({ status, msg, error });
  }
};
