import { generateToken } from "../utils/jwtUtils.mjs";
import bcrypt from "bcrypt";
import { createUser, findUserByUsername } from "../models/userModel.mjs";

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await findUserByUsername(username);
    if (userExists) {
      return res.status(404).json({ message: "User already exists" });
    }
    const userId = await createUser(username, password);
    res.status(201).json({ message: `User id: ${userId} created` });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      // OWASP guidelines recommend that app should respond with generic error message!
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // OWASP guidelines recommend that app should respond with generic error message!
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user);

    return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
