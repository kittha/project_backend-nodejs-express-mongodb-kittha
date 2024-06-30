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

export {
  formatQuestion,
  formatQuestionWithUpvoteDownvote,
  formatAnswer,
  formatAnswerWithUpvoteDownvote,
};
