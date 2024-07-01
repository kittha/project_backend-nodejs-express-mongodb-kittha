export const validateCreateUpdateAnswer = (req, res, next) => {
  if (!req.body.content) {
    return res.status(400).json({
      message: "400 Bad Request: Missing or invalid request data.",
    });
  }

  if (req.body.content.length > 300) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid request data. Please input not exceed 300 characters.",
    });
  }

  next();
};
