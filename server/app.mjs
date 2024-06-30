import express from "express";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import { client } from "./utils/db.mjs";
import { rateLimiter } from "./middlewares/basic-rate-limit.mjs";
import questionRouter from "./routes/questionsRoutes.mjs";
import answerRouter from "./routes/answers.mjs";

async function init() {
  const app = express();
  const port = 4000;

  const yamlFile = fs.readFileSync("./swagger.yaml", "utf8");
  const swaggerDocument = yaml.load(yamlFile);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  await client.connect();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(rateLimiter(50, 60000));
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
