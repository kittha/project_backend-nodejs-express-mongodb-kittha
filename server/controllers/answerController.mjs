import {
  getAnswerById as getAnswerByIdFromModel,
  handleAnswerVote as handleAnswerVoteFromModel,
  updateAnswer as updateAnswerFromModel,
  deleteAnswer as deleteAnswerFromModel,
} from "../models/answersModel.mjs";
import {
  formatAnswer,
  formatAnswerWithUpvoteDownvote,
} from "../utils/formatters.mjs";

// GET
export const getAnswerById = async (req, res) => {
  try {
    const result = await getAnswerByIdFromModel(req.params.id);

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
};

// POST
export const handleAnswerUpvote = async (req, res) => {
  try {
    const voteValue = 1;
    const result = await handleAnswerVoteFromModel(req.params.id, voteValue);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }
    const formattedAnswer = formatAnswerWithUpvoteDownvote(
      result.answer,
      result.aggregatedVote
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
};

export const handleAnswerDownvote = async (req, res) => {
  try {
    const voteValue = -1;
    const result = await handleAnswerVoteFromModel(req.params.id, voteValue);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }
    const formattedAnswer = formatAnswerWithUpvoteDownvote(
      result.answer,
      result.aggregatedVote
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
};

// PUT
export const updateAnswer = async (req, res) => {
  try {
    const result = await updateAnswerFromModel(req);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const formattedAnswer = formatAnswer(result);

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
};

// DELETE
export const deleteAnswer = async (req, res) => {
  try {
    const result = await deleteAnswerFromModel(req.params.id);

    if (!result) {
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
};
