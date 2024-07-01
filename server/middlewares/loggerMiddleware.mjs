import logger from "../utils/logger.mjs";

const requestLogger = (req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  next();
};

export default requestLogger;
