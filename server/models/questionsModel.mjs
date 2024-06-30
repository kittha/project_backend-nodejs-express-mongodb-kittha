import { db } from "../utils/db.mjs";
import { ObjectId } from "bson";

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
export const getAllQuestions = async (req) => {
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
    return result;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};

export const getQuestionById = async (id) => {
  try {
    const questionId = ObjectId.createFromHexString(id);

    const collection = db.collection("questions");
    const result = await collection.findOne({ _id: questionId });

    return result;
  } catch (error) {
    console.error("Error fetching question by ID: ", error);
  }
};
export const getAnswerByQuestionId = async (id) => {
  try {
    const questionId = ObjectId.createFromHexString(id);

    if (!(await checkIfQuestionExist(questionId))) {
      return false;
    }

    const collection = db.collection("answers");
    const result = await collection.find({ question_id: questionId }).toArray();

    return result;
  } catch (error) {
    console.error("Error fetching answer by ID: ", error);
  }
};

// POST
export const createQuestion = async (reqBodyData) => {
  try {
    const questionData = {
      ...reqBodyData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = db.collection("questions");
    const result = await collection.insertOne(questionData);

    if (!result.acknowledged) {
      throw new Error("Failed to insert question");
    }

    const question = await collection.findOne({ _id: result.insertedId });
    return question;
  } catch (error) {
    console.error("Error creating question: ", error);
  }
};

export const createAnswerByQuestionId = async (req) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    if (!(await checkIfQuestionExist(questionId))) {
      return false;
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

    const resultObj = { insertedId, answerData };

    return resultObj;
  } catch (error) {
    console.error("Error creating answer: ", error);
  }
};

export const handleQuestionVote = async (id, voteValue) => {
  try {
    const questionId = ObjectId.createFromHexString(id);

    // fetch question
    const questionCollection = db.collection("questions");
    const question = await questionCollection.findOne({ _id: questionId });

    if (!question) {
      return false;
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
      throw new Error(
        `Failed to insert ${voteValue === 1 ? "upvote" : "downvote"} record`
      );
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

    const resultObj = { question, aggregatedVote };
    return resultObj;
  } catch (error) {
    console.error("Error voting question: ", error);
  }
};

// PUT
export const updateQuestion = async (req) => {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

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
      return false;
    }

    const updatedQuestion = await collection.findOne({ _id: questionId });
    return updatedQuestion;
  } catch (error) {
    console.error("Error updating question: ", error);
  }
};

// DELETE
export const deleteQuestion = async (id) => {
  try {
    const questionId = ObjectId.createFromHexString(id);

    if (!(await checkIfQuestionExist(questionId))) {
      return false;
    }
    // delete the question
    const questionsCollection = db.collection("questions");
    const deletedQuestionResult = await questionsCollection.deleteOne({
      _id: questionId,
    });

    if (deletedQuestionResult.deletedCount === 0) {
      return false;
    }
    // after delete the question, delete associated answers
    // (if the question don't have answers, the deleteAnswerResult will return deletedCount : 0)
    const answerCollection = db.collection("answers");
    await answerCollection.deleteMany({
      question_id: questionId,
    });

    return deletedQuestionResult;
  } catch (error) {
    console.error("Error deleting question: ", error);
  }
};
