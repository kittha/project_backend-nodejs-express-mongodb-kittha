import { MongoClient } from "mongodb";
import "dotenv/config";

const connectionString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
let db;

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(connectionString);
    await client.connect();
    db = client.db("practice-mongo");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    process.exit(1);
  }
};

connectToDatabase();

export { db };
