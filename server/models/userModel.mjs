import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const createUser = async (username, password) => {
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const result = await db
    .collection("techup_users")
    .insertOne({ username: username, password: hashPassword });
  return result.insertedId;
};

export const findUserByUsername = async (username) => {
  return db.collection("techup_users").findOne({ username });
};

export const findUserById = async (id) => {
  return db.collection("techup_users").findOne({ _id: ObjectId(id) });
};
