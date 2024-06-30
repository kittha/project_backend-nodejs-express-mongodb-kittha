import express from "express";
import { loadSwaggerDocument } from "./utils/swagger.mjs";
import swaggerUi from "swagger-ui-express";
import { rateLimiter } from "./middlewares/basic-rate-limit.mjs";
import questionRouter from "./routes/questionsRoutes.mjs";
import answerRouter from "./routes/answersRoutes.mjs";
import authRoutes from "./routes/authRoutes.mjs";

async function init() {
  const app = express();
  const port = 4000;

  const swaggerDocument = await loadSwaggerDocument("./swagger.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(rateLimiter(50, 60000));
  app.use("/auth", authRoutes);
  app.use("/questions", questionRouter);
  app.use("/answers", answerRouter);

  app.get("/test", (req, res) => {
    res.send("Hello World");
  });

  app.get("*", (req, res) => {
    res.status(404).send("Not Found");
  });

  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}

init();
