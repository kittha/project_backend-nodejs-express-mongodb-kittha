import { Router } from "express";
import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";
import { validateCreateUpdateQuestion } from "../middlewares/post-put-questions.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";

const questionRouter = Router();
export default questionRouter;

function formatQuestion(question) {
  return {
    id: question._id.toString(),
    title: question.title,
    description: question.description,
    category: question.category,
    created_at: question.created_at.toISOString(),
    updated_at: question.updated_at.toISOString(),
  };
}

// GET
questionRouter.get("/", async (req, res) => {
  try {
    const title = req.query.title ? new RegExp(req.query.title, "i") : null;
    const category = req.query.category
      ? new RegExp(req.query.category, "i")
      : null;

    const query = {
      $or: [],
    };

    if (title) {
      query.$or.push({ title });
    }
    if (category) {
      query.$or.push({ category });
    }

    if (query.$or.length === 0) {
      delete query.$or;
    }
    const collection = db.collection("questions");
    const result = await collection.find(query).limit(10).toArray();

    const formattedQuestions = result.map(formatQuestion);

    return res.status(200).json({
      message: "Success",
      data: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

questionRouter.get("/:id", async (req, res) => {
  try {
    const questionId = new ObjectId(req.params.id);

    const collection = db.collection("questions");
    const result = await collection.findOne({ _id: questionId });

    if (!result) {
      return res.status(404).json({ error: "Question not found" });
    }
    const formattedQuestion = formatQuestion(result);

    return res
      .status(200)
      .json({ message: "Success", data: formattedQuestion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// POST
questionRouter.post("/", async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = db.collection("questions");
    const result = await collection.insertOne(questionData);

    if (!result.acknowledged) {
      throw new Error("Failed to insert question");
    }
    const insertedId = result.insertedId;

    const formattedQuestion = formatQuestion({
      _id: insertedId,
      ...questionData,
    });

    return res.status(201).json({
      message: `Create question successfully`,
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});
