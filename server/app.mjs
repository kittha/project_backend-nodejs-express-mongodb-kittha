import express from "express";
import { client } from "./utils/db.mjs";
import questionRouter from "./routes/questions.mjs";
import answerRouter from "./routes/answers.mjs";

async function init() {
  const app = express();
  const port = 4000;

  await client.connect();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
