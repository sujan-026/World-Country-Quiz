import express from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js"; // Import Supabase client
import dotenv from "dotenv";

const app = express();
const port = 4000;

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let quiz = [];

async function fetchQuizData() {
  try {
    const { data, error } = await supabase
      .from('capitals')
      .select('*');

    if (error) {
      throw error;
    }
    
    quiz = data;
  } catch (err) {
    console.error("Error fetching quiz data", err);
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
  console.log(currentQuestion);
});

// POST a new answer
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;

  if (currentQuestion.capital_name.toLowerCase() === answer.toLowerCase()) {
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
  const randomIndex = Math.floor(Math.random() * quiz.length);
  currentQuestion = quiz[randomIndex];
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
