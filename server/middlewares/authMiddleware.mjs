import jwt from "jsonwebtoken";
import "dotenv/config";
import logger from "../utils/logger.mjs";

const secretKey = process.env.SRV_PRIVATE_KEY;

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    logger.warn("No token provided");
    return res.status(403).json({ message: "No token provided" });
  }

  const tokenWithoutBearer = token.split(" ")[1];

  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      logger.error(`Failed to authenticate token: ${err.message}`);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    logger.info(`Token authenticated for user ID: ${decoded.id}`);
    next();
  });
};
