import { Router } from "express";
import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";

const answerRouter = Router();

function formatAnswerWithUpvoteDownvote(answer, aggregatedVoteData) {
  return {
    id: answer._id.toString(),
    question_id: answer.question_id,
    content: answer.content ? answer.content : "",
    created_at: answer.created_at ? answer.created_at.toISOString() : null,
    updated_at: answer.updated_at ? answer.updated_at.toISOString() : null,
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

async function checkIfAnswerExist(answerIdObj) {
  try {
    const collection = db.collection("answers");
    const result = await collection.findOne({ _id: answerIdObj });
    return result !== null;
  } catch (error) {
    console.error("Error checking if question exists: ", error);
    return false;
  }
}

// GET
answerRouter.get("/:id", async (req, res) => {
  try {
    const answerId = ObjectId.createFromHexString(req.params.id);
    const collection = db.collection("answers");
    const result = await collection.findOne({ _id: answerId });

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found",
      });
    }

    const formattedAnswer = formatAnswer(result);
    return res.status(200).json({
      message: "200 OK: Successfully retrieved the answer.",
      data: formattedAnswer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});
// POST
answerRouter.post(
  "/:id/upvote",
  [rateLimiter(100, 1440000)],
  async (req, res) => {
    try {
      const answerId = ObjectId.createFromHexString(req.params.id);
      const voteValue = 1;

      if (!(await checkIfAnswerExist(answerId))) {
        return res.status(404).json({
          error: "Answer not found",
        });
      }

      // fetch answer
      const answerCollection = db.collection("answers");
      const answer = await answerCollection.findOne({ _id: answerId });

      if (!answer) {
        return res.status(404).json({
          error: "Answer not found",
        });
      }
      // Insert new upvote record
      const answerVotesCollection = db.collection("answer_votes");
      const insertResult = await answerVotesCollection.insertOne({
        answer_id: answerId,
        vote: voteValue,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!insertResult.acknowledged) {
        throw new Error("Failed to insert upvote record");
      }

      // Calculate total upvotes and downvotes
      const voteAggregation = await answerVotesCollection
        .aggregate([
          { $match: { answer_id: answerId } },
          {
            $group: {
              _id: "$answer_id",
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

      const formattedAnswer = formatAnswerWithUpvoteDownvote(
        answer,
        aggregatedVote
      );

      return res.status(200).json({
        message: "200 OK: Successfully upvoted the answer.",
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

answerRouter.post(
  "/:id/downvote",
  [rateLimiter(100, 1440000)],
  async (req, res) => {
    try {
      const answerId = ObjectId.createFromHexString(req.params.id);
      const voteValue = 1;

      if (!(await checkIfAnswerExist(answerId))) {
        return res.status(404).json({
          error: "Answer not found",
        });
      }

      // fetch question
      const answerCollection = db.collection("answers");
      const answer = await answerCollection.findOne({ _id: answerId });

      if (!answer) {
        return res.status(404).json({
          error: "Answer not found",
        });
      }
      // Insert new downvote record
      const answerVotesCollection = db.collection("answer_votes");
      const insertResult = await answerVotesCollection.insertOne({
        answer_id: answerId,
        vote: voteValue,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!insertResult.acknowledged) {
        throw new Error("Failed to insert downvote record");
      }

      // Calculate total upvotes and downvotes
      const voteAggregation = await answerVotesCollection
        .aggregate([
          { $match: { answer_id: answerId } },
          {
            $group: {
              _id: "$answer_id",
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

      const formattedAnswer = formatAnswerWithUpvoteDownvote(
        answer,
        aggregatedVote
      );

      return res.status(200).json({
        message: "200 OK: Successfully downvoted the answer.",
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

// PUT
answerRouter.put(
  "/:id",
  [validateCreateUpdateAnswer, rateLimiter(10, 60000)],
  async (req, res) => {
    try {
      const answerId = ObjectId.createFromHexString(req.params.id);

      if (!(await checkIfAnswerExist(answerId))) {
        return res.status(404).json({
          message: "404 Not Found: Answer not found",
        });
      }

      const updatedData = {
        ...req.body,
        updated_at: new Date(),
      };

      const collection = db.collection("answers");
      const updateResult = await collection.updateOne(
        { _id: answerId },
        { $set: updatedData }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to update answer");
      }

      // return response body in custom format
      const updatedAnswer = await collection.findOne({ _id: answerId });

      const formattedAnswer = formatAnswer(updatedAnswer);
      return res.status(202).json({
        message: "Update question successfully",
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

// DELETE
answerRouter.delete("/:id", async (req, res) => {
  try {
    const answerId = ObjectId.createFromHexString(req.params.id);

    if (!(await checkIfAnswerExist(answerId))) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found",
      });
    }

    // delete the answer
    const answersCollection = db.collection("answers");
    const deletedAnswerResult = await answersCollection.deleteOne({
      _id: answerId,
    });

    if (deletedAnswerResult.deletedCount === 0) {
      throw new Error("Failed to delete answer");
    }

    return res.status(200).json({
      message: "Answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export default answerRouter;
