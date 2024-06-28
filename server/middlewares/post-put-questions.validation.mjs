export const validateCreateUpdateQuestion = (req, res, next) => {
  const { title, description } = req.body;

  if (
    !title ||
    typeof title !== "string" ||
    title.length < 10 ||
    title.length > 100
  ) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid title. Please input between 10 to 100 characters.",
    });
  }

  if (
    (description && typeof description !== "string") ||
    description.length > 300
  ) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid description. Please input not exceed 300 characters.",
    });
  }

  next();
};
