import express from "express";
import bodyParser from "body-parser";
import { Pool } from "pg"; // Correctly import Pool from pg
import dotenv from "dotenv";

const app = express();
const port = 4000;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  max: 5,
  min: 2,
  idleTimeoutMillis: 600000,
});

let quiz = [];

async function fetchQuizData() {
  try {
    const res = await pool.query("SELECT * FROM capitals");
    quiz = res.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
}

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await fetchQuizData(); // Fetch quiz data before proceeding
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;

  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  await nextQuestion(); // Ensure the next question is fetched
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
