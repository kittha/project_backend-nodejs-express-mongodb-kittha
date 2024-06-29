import { Router } from "express";
import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";
import { formatAnswer, handleAnswerVote } from "../utils/formatters.mjs";

const answerRouter = Router();

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
      message: "Server could not process the request due to database issue.",
    });
  }
});
// POST
answerRouter.post(
  "/:id/upvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const voteValue = 1;
    handleAnswerVote(req, res, voteValue);
  }
);

answerRouter.post(
  "/:id/downvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const voteValue = -1;
    handleAnswerVote(req, res, voteValue);
  }
);

// PUT
answerRouter.put(
  "/:id",
  [validateCreateUpdateAnswer, rateLimiter(10, 60000)],
  async (req, res) => {
    try {
      const answerId = ObjectId.createFromHexString(req.params.id);

      const answerData = {
        ...req.body,
        updated_at: new Date(),
      };

      const collection = db.collection("answers");
      const result = await collection.updateOne(
        { _id: answerId },
        { $set: answerData }
      );

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ message: "404 Not Found: Answer not found." });
      }

      // return response body in custom format
      const updatedAnswer = await collection.findOne({ _id: answerId });
      const formattedAnswer = formatAnswer(updatedAnswer);

      return res.status(200).json({
        message: "200 OK: Successfully updated the answer.",
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

// DELETE
answerRouter.delete("/:id", [rateLimiter(10, 60000)], async (req, res) => {
  try {
    const answerId = ObjectId.createFromHexString(req.params.id);

    // delete the answer
    const collection = db.collection("answers");
    const result = await collection.deleteOne({
      _id: answerId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "404 Not Found: Answer not found." });
    }

    return res.status(200).json({
      message: "200 OK: Answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

export default answerRouter;
