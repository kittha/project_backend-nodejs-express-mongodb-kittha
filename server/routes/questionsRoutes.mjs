import express from "express";
import { validateCreateUpdateQuestion } from "../middlewares/post-put-questions.validation.mjs";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";
import {
  getAllQuestions,
  getQuestionById,
  getAnswersByQuestionId,
  createQuestion,
  createAnswerByQuestionId,
  handleQuestionUpvote,
  handleQuestionDownvote,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.mjs";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);
router.get("/:id/answers", getAnswersByQuestionId);
router.post(
  "/",
  [validateCreateUpdateQuestion, rateLimiter(10, 60000)],
  createQuestion
);
router.post(
  "/:id/answers",
  [validateCreateUpdateAnswer, rateLimiter(10, 60000)],
  createAnswerByQuestionId
);
router.post("/:id/upvote", [rateLimiter(10, 1440000)], handleQuestionUpvote);
router.post(
  "/:id/downvote",
  [rateLimiter(10, 1440000)],
  handleQuestionDownvote
);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
