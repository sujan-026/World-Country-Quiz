import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const port = 4000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

async function fetchQuizData() {
    const { data, error } = await supabase.from('capitals').select('*');
    if (error) {
        console.error('Error fetching quiz data:', error);
        return [];
    }
    console.log(data[0]);
    return data;
}

async function nextQuestion() {
    const randomIndex = Math.floor(Math.random() * quiz.length);
    currentQuestion = quiz[randomIndex];
}

// GET home page
app.get('/', async (req, res) => {
    totalCorrect = 0;
    quiz = await fetchQuizData(); // Fetch quiz data before proceeding
    await nextQuestion();
    res.render('index', { question: currentQuestion });
});

// POST answer submission
app.post('/submit', async (req, res) => {
    const answer = req.body.answer.trim();
    let isCorrect = false;

    if (currentQuestion.capital_name.toLowerCase() === answer.toLowerCase()) {
        totalCorrect++;
        isCorrect = true;
    }

    await nextQuestion(); // Ensure the next question is fetched
    res.render('index', {
        question: currentQuestion,
        wasCorrect: isCorrect,
        totalScore: totalCorrect,
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
