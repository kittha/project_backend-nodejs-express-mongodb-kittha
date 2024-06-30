import jwt from "jsonwebtoken";
import "dotenv/config";

const secretKey = process.env.SRV_PRIVATE_KEY;

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });
};
