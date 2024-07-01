import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import logger from "../utils/logger.mjs";

const saltRounds = 10;

export const createUser = async (username, password) => {
  try {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const result = await db
      .collection("techup_users")
      .insertOne({ username: username, password: hashPassword });

    logger.info(`User created: username=${username}`);
    return result.insertedId;
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw error;
  }
};

export const findUserByUsername = async (username) => {
  try {
    const user = await db.collection("techup_users").findOne({ username });

    if (!user) {
      logger.warn(`User not found for username=${username}`);
    }

    return user;
  } catch (error) {
    logger.error(
      `Error finding user by username=${username}: ${error.message}`
    );
    throw error;
  }
};

export const findUserById = async (id) => {
  try {
    const user = await db
      .collection("techup_users")
      .findOne({ _id: ObjectId(id) });

    if (!user) {
      logger.warn(`User not found for ID=${id}`);
    }

    return user;
  } catch (error) {
    logger.error(`Error finding user by ID=${id}: ${error.message}`);
    throw error;
  }
};
