import { MongoClient } from "mongodb";

const connectionSTring = "mongodb://127.0.0.1:27017";

export const client = new MongoClient(connectionSTring);

export const db = client.db("practice-mongo");
