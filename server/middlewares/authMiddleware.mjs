import jwt from "jsonwebtoken";
import "dotenv/config";

const secretKey = process.env.SRV_PRIVATE_KEY;

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  const tokenParts = token.split(" ");
  const tokenValue = tokenParts[1];
  jwt.verify(tokenValue, secretKey, (err, decoded) => {
    if (err) {
      console.log(tokenValue);

      console.log(err);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      } else {
        return res
          .status(500)
          .json({ message: "Failed to authenticate token" });
      }
    }
    req.userId = decoded.id;
    next();
  });
};
