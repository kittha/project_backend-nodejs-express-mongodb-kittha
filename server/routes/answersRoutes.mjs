import express from "express";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";
import {
  getAnswerById,
  handleAnswerUpvote,
  handleAnswerDownvote,
  updateAnswer,
  deleteAnswer,
} from "../controllers/answerController.mjs";

const router = express.Router();

router.get("/:id", getAnswerById);
router.post("/:id/upvote", [rateLimiter(10, 1440000)], handleAnswerUpvote);
router.post("/:id/downvote", [rateLimiter(10, 1440000)], handleAnswerDownvote);
router.put("/:id", updateAnswer);
router.delete("/:id", deleteAnswer);

export default router;
