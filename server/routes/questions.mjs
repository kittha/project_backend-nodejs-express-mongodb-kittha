import { Router } from "express";
import { db } from "../utils/db.mjs";
import { ObjectId } from "bson";
import { validateCreateUpdateQuestion } from "../middlewares/post-put-questions.validation.mjs";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";

const questionRouter = Router();
export default questionRouter;

function formatQuestion(question) {
  return {
    id: question._id.toString(),
    title: question.title ? question.title : "",
    description: question.description ? question.description : "",
    category: question.category ? question.category : "",
    created_at: question.created_at ? question.created_at.toISOString() : null,
    updated_at: question.updated_at ? question.updated_at.toISOString() : null,
  };
}

function formatQuestionWithUpvoteDownvote(question, aggregatedVoteData) {
  return {
    id: question._id.toString(),
    title: question.title ? question.title : "",
    description: question.description ? question.description : "",
    category: question.category ? question.category : "",
    created_at: question.created_at ? question.created_at.toISOString() : null,
    updated_at: question.updated_at ? question.updated_at.toISOString() : null,
    upvotes: aggregatedVoteData.total_upvotes || 0,
    downvotes: aggregatedVoteData.total_downvotes || 0,
  };
}

function formatAnswer(answer) {
  return {
    id: answer._id.toString(),
    question_id: answer.question_id ? answer.question_id : "",
    content: answer.content ? answer.content : "",
    created_at: answer.created_at ? answer.created_at.toISOString() : null,
    updated_at: answer.updated_at ? answer.updated_at.toISOString() : null,
  };
}

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
      return res.status(404).json({ error: "Question not found" });
    }

    // return response body in custom format
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
    const questionId = ObjectId.createFromHexString(req.params.id);

    const collection = db.collection("questions");
    const result = await collection.findOne({ _id: questionId });

    if (!result) {
      return res.status(404).json({ error: "Question not found" });
    }

    // return response body in custom format
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

questionRouter.get("/:id/answers", async (req, res) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    if (!(await checkIfQuestionExist(questionId))) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const collection = db.collection("answers");
    const result = await collection.find({ question_id: questionId }).toArray();

    if (!result) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const formattedAnswers = result.map(formatAnswer);

    return res.status(200).json({
      message: "Success",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
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
          error: "Question not found",
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
        message: `Create question successfully`,
        data: formattedAnswer,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

questionRouter.post(
  "/:id/upvote",
  [rateLimiter(100, 1440000)],
  async (req, res) => {
    try {
      const questionId = ObjectId.createFromHexString(req.params.id);
      const voteValue = 1;

      if (!(await checkIfQuestionExist(questionId))) {
        return res.status(404).json({
          error: "Question not found",
        });
      }

      // fetch question
      const questionCollection = db.collection("questions");
      const question = await questionCollection.findOne({ _id: questionId });

      if (!question) {
        return res.status(404).json({
          error: "Question not found",
        });
      }
      // Insert new upvote record
      const questionVotesCollection = db.collection("question_votes");
      const insertResult = await questionVotesCollection.insertOne({
        question_id: questionId,
        vote: voteValue,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!insertResult.acknowledged) {
        throw new Error("Failed to insert upvote record");
      }

      // Calculate total upvotes and downvotes
      const voteAggregation = await questionVotesCollection
        .aggregate([
          { $match: { question_id: questionId } },
          {
            $group: {
              _id: "$question_id",
              total_upvotes: {
                $sum: { $cond: [{ $eq: ["$vote", 1] }, 1, 0] },
              },
              total_downvotes: {
                $sum: { $cond: [{ $eq: ["$vote", -1] }, 1, 0] },
              },
            },
          },
        ])
        .toArray();

      const aggregatedVote = voteAggregation[0] || {
        total_upvotes: 0,
        total_downvotes: 0,
      };

      // return response body in a custom format by merge result of question and updatedQuesion
      const formattedQuestion = formatQuestionWithUpvoteDownvote(
        question,
        aggregatedVote
      );

      return res.status(200).json({
        message: "200 OK: Successfully upvoted the question.",
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

questionRouter.post(
  "/:id/downvote",
  [rateLimiter(100, 1440000)],
  async (req, res) => {
    try {
      const questionId = ObjectId.createFromHexString(req.params.id);
      const voteValue = -1;

      if (!(await checkIfQuestionExist(questionId))) {
        return res.status(404).json({
          error: "Question not found",
        });
      }

      // fetch question
      const questionCollection = db.collection("questions");
      const question = await questionCollection.findOne({ _id: questionId });

      if (!question) {
        return res.status(404).json({
          error: "Question not found",
        });
      }
      // Insert new downvote record
      const questionVotesCollection = db.collection("question_votes");
      const insertResult = await questionVotesCollection.insertOne({
        question_id: questionId,
        vote: voteValue,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!insertResult.acknowledged) {
        throw new Error("Failed to insert downvote record");
      }

      // Calculate total upvotes and downvotes
      const voteAggregation = await questionVotesCollection
        .aggregate([
          { $match: { question_id: questionId } },
          {
            $group: {
              _id: "$question_id",
              total_upvotes: {
                $sum: { $cond: [{ $eq: ["$vote", 1] }, 1, 0] },
              },
              total_downvotes: {
                $sum: { $cond: [{ $eq: ["$vote", -1] }, 1, 0] },
              },
            },
          },
        ])
        .toArray();

      const aggregatedVote = voteAggregation[0] || {
        total_upvotes: 0,
        total_downvotes: 0,
      };

      // return response body in a custom format by merge result of question and updatedQuesion
      const formattedQuestion = formatQuestionWithUpvoteDownvote(
        question,
        aggregatedVote
      );

      return res.status(200).json({
        message: "200 OK: Successfully downvoted the question.",
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
// PUT
questionRouter.put(
  "/:id",
  [validateCreateUpdateQuestion, rateLimiter(10, 60000)],
  async (req, res) => {
    try {
      const questionId = ObjectId.createFromHexString(req.params.id);

      if (!(await checkIfQuestionExist(questionId))) {
        return res.status(404).json({
          message: "404 Not Found: Question not found",
        });
      }

      const updatedData = {
        ...req.body,
        updated_at: new Date(),
      };

      const collection = db.collection("questions");
      const updateResult = await collection.updateOne(
        { _id: questionId },
        { $set: updatedData }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to update question");
      }

      // return response body in custom format
      const updatedQuestion = await collection.findOne({ _id: questionId });
      const formattedQuestion = formatQuestion(updatedQuestion);

      return res.status(202).json({
        message: "Update question successfully",
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
questionRouter.delete("/:id", async (req, res) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    if (!(await checkIfQuestionExist(questionId))) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    // delete the question
    const questionsCollection = db.collection("questions");
    const deletedQuestionResult = await questionsCollection.deleteOne({
      _id: questionId,
    });

    if (deletedQuestionResult.deletedCount === 0) {
      throw new Error("Failed to delete question");
    }
    // after delete the question, delete associated answers
    // (if the question don't have answers, the deleteAnswerResult will return deletedCount : 0)
    const answerCollection = db.collection("answers");
    const deletedAnswerResult = await answerCollection.deleteMany({
      question_id: questionId,
    });

    return res.status(200).json({
      message: "Question and associated answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});
