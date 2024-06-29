import { Router } from "express";
import { db } from "../utils/db.mjs";
import { ObjectId } from "bson";
import { validateCreateUpdateQuestion } from "../middlewares/post-put-questions.validation.mjs";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";
import {
  formatQuestion,
  formatAnswer,
  handleQuestionVote,
} from "../utils/formatters.mjs";

const questionRouter = Router();

async function checkIfQuestionExist(questionIdObj) {
  try {
    const collection = db.collection("questions");
    const result = await collection.findOne({ _id: questionIdObj });
    return result !== null;
  } catch (error) {
    console.error("Error checking if question exists: ", error);
    return false;
  }
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

    if (!result) {
      return res
        .status(404)
        .json({ message: "404 Not Found: Question not found" });
    }

    // return response body in custom format
    const formattedQuestions = result.map(formatQuestion);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the list of questions.",
      data: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return res.status(500).json({
      error: "Server could not process the request due to database issue.",
    });
  }
});

questionRouter.get("/:questionId", async (req, res) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.questionId);

    const collection = db.collection("questions");
    const result = await collection.findOne({ _id: questionId });

    if (!result) {
      return res
        .status(404)
        .json({ message: "404 Not Found: Question not found" });
    }

    // return response body in custom format
    const formattedQuestion = formatQuestion(result);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the question",
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

questionRouter.get("/:id/answers", async (req, res) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    if (!(await checkIfQuestionExist(questionId))) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    const collection = db.collection("answers");
    const result = await collection.find({ question_id: questionId }).toArray();

    if (!result) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const formattedAnswers = result.map(formatAnswer);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the answers",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

// POST
questionRouter.post(
  "/",
  [validateCreateUpdateQuestion, rateLimiter(10, 60000)],
  async (req, res) => {
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

      // return response body in a custom format
      const question = await collection.findOne({ _id: result.insertedId });
      const formattedQuestion = formatQuestion(question);

      return res.status(201).json({
        message: "201 Created: Question created successfully.",
        data: formattedQuestion,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server could not process the request due to database issue.",
      });
    }
  }
);

questionRouter.post(
  "/:id/answers",
  [validateCreateUpdateAnswer, rateLimiter(10, 60000)],
  async (req, res) => {
    try {
      const questionId = ObjectId.createFromHexString(req.params.id);

      if (!(await checkIfQuestionExist(questionId))) {
        return res.status(404).json({
          message: "404 Not Found: Question not found",
        });
      }

      const answerData = {
        ...req.body,
        question_id: questionId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const collection = db.collection("answers");
      const result = await collection.insertOne(answerData);

      if (!result.acknowledged) {
        throw new Error("Failed to insert answer");
      }

      // return response body in a custom format
      const insertedId = result.insertedId;
      const formattedAnswer = formatAnswer({
        _id: insertedId,
        ...answerData,
      });

      return res.status(201).json({
        message: "201 Created: Answer created successfully.",
        data: formattedAnswer,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server could not process the request due to database issue.",
      });
    }
  }
);

questionRouter.post(
  "/:id/upvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const voteValue = 1;
    return handleQuestionVote(req, res, voteValue);
  }
);

questionRouter.post(
  "/:id/downvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const voteValue = -1;
    return handleQuestionVote(req, res, voteValue);
  }
);
// PUT
questionRouter.put(
  "/:questionId",
  [validateCreateUpdateQuestion, rateLimiter(10, 60000)],
  async (req, res) => {
    try {
      const questionId = ObjectId.createFromHexString(req.params.questionId);

      const questionData = {
        ...req.body,
        updated_at: new Date(),
      };

      const collection = db.collection("questions");
      const result = await collection.updateOne(
        { _id: questionId },
        { $set: questionData }
      );

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ message: "404 Not Found: Question not found." });
      }

      // return response body in custom format
      const updatedQuestion = await collection.findOne({ _id: questionId });
      const formattedQuestion = formatQuestion(updatedQuestion);

      return res.status(200).json({
        message: "200 OK: Successfully updated the question.",
        data: formattedQuestion,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

// DELETE
questionRouter.delete("/:id", rateLimiter(10, 60000), async (req, res) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    // delete the question
    const questionsCollection = db.collection("questions");
    const deletedQuestionResult = await questionsCollection.deleteOne({
      _id: questionId,
    });

    if (deletedQuestionResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "404 Not Found: Question not found." });
    }
    // after delete the question, delete associated answers
    // (if the question don't have answers, the deleteAnswerResult will return deletedCount : 0)
    const answerCollection = db.collection("answers");
    await answerCollection.deleteMany({
      question_id: questionId,
    });

    return res.status(200).json({
      message: "Question and associated answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

export default questionRouter;
