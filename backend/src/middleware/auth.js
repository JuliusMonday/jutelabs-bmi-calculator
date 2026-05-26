const logger = require("../logger");

const authMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return next();
  }

  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    logger.warn(
      "Unauthorized request without bearer token to %s",
      req.originalUrl,
    );
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = header.split(" ")[1];
  if (token !== apiKey) {
    logger.warn(
      "Unauthorized request with invalid bearer token to %s",
      req.originalUrl,
    );
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  next();
};

module.exports = authMiddleware;
