import { db } from "./db.mjs";
import { ObjectId } from "mongodb";

function formatQuestion(question) {
  return {
    id: question._id.toHexString(),
    title: question.title ? question.title : "",
    description: question.description ? question.description : "",
    category: question.category ? question.category : "",
    created_at: question.created_at ? question.created_at.toISOString() : null,
    updated_at: question.updated_at ? question.updated_at.toISOString() : null,
  };
}

function formatQuestionWithUpvoteDownvote(question, aggregatedVoteData) {
  return {
    ...formatQuestion(question),
    upvotes: aggregatedVoteData.total_upvotes || 0,
    downvotes: aggregatedVoteData.total_downvotes || 0,
  };
}

function formatAnswer(answer) {
  return {
    id: answer._id.toHexString(),
    question_id: answer.question_id ? answer.question_id : "",
    content: answer.content ? answer.content : "",
    created_at: answer.created_at ? answer.created_at.toISOString() : null,
    updated_at: answer.updated_at ? answer.updated_at.toISOString() : null,
  };
}

function formatAnswerWithUpvoteDownvote(answer, aggregatedVoteData) {
  return {
    ...formatAnswer(answer),
    upvotes: aggregatedVoteData.total_upvotes || 0,
    downvotes: aggregatedVoteData.total_downvotes || 0,
  };
}

async function handleQuestionVote(req, res, voteValue) {
  try {
    const questionId = ObjectId.createFromHexString(req.params.id);

    // fetch question
    const questionCollection = db.collection("questions");
    const question = await questionCollection.findOne({ _id: questionId });

    if (!question) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
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

    const formattedQuestion = formatQuestionWithUpvoteDownvote(
      question,
      aggregatedVote
    );

    return res.status(200).json({
      message: `200 OK: Successfully ${
        voteValue === 1 ? "upvoted" : "downvoted"
      } the question.`,
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
}

async function handleAnswerVote(req, res, voteValue) {
  try {
    const answerId = ObjectId.createFromHexString(req.params.id);

    // fetch answer
    const answerCollection = db.collection("answers");
    const answer = await answerCollection.findOne({ _id: answerId });

    if (!answer) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    // check if the associated question exists
    const questionId = answer.question_id;
    const questionCollection = db.collection("questions");
    const question = await questionCollection.findOne({ _id: questionId });

    if (!question) {
      return res.status(404).json({
        message: "404 Not Found: Associated question not found",
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

    const formattedAnswer = formatAnswerWithUpvoteDownvote(
      answer,
      aggregatedVote
    );

    return res.status(200).json({
      message: `200 OK: Successfully ${
        voteValue === 1 ? "upvoted" : " downvoted"
      } the answer.`,
      data: formattedAnswer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
}

export {
  formatQuestion,
  formatQuestionWithUpvoteDownvote,
  formatAnswer,
  formatAnswerWithUpvoteDownvote,
  handleQuestionVote,
  handleAnswerVote,
};
