import { db } from "../utils/db.mjs";
import { ObjectId } from "mongodb";

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
export const getAnswerById = async (id) => {
  try {
    const answerId = ObjectId.createFromHexString(id);
    const collection = db.collection("answers");
    const result = await collection.findOne({ _id: answerId });

    if (!result) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};
// POST
export const handleAnswerVote = async (id, voteValue) => {
  try {
    const answerId = ObjectId.createFromHexString(id);

    // fetch answer
    const answerCollection = db.collection("answers");
    const answer = await answerCollection.findOne({ _id: answerId });

    if (!answer) {
      return false;
    }

    // check if the associated question exists
    const questionId = answer.question_id;
    const questionCollection = db.collection("questions");
    const question = await questionCollection.findOne({ _id: questionId });

    if (!question) {
      return false;
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
      throw new Error(
        `Failed to insert ${voteValue === 1 ? "upvote" : "downvote"} record`
      );
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
    const resultObj = { answer, aggregatedVote };
    return resultObj;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};

// PUT
export const updateAnswer = async (req) => {
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
      return false;
    }

    // return response body in custom format
    const updatedAnswer = await collection.findOne({ _id: answerId });
    return updatedAnswer;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};

// DELETE
export const deleteAnswer = async (id) => {
  try {
    const answerId = ObjectId.createFromHexString(id);

    // delete the answer
    const collection = db.collection("answers");
    const result = await collection.deleteOne({
      _id: answerId,
    });

    if (result.deletedCount === 0) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};
