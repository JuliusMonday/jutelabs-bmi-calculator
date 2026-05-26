const { createLogger, transports, format } = require("winston");

const isProduction = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    isProduction
      ? format.json()
      : format.combine(
          format.colorize(),
          format.printf(({ timestamp, level, message, stack }) => {
            return stack
              ? `${timestamp} ${level}: ${message} - ${stack}`
              : `${timestamp} ${level}: ${message}`;
          }),
        ),
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
