const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const Student = require('../models/Student');

// GET /api/practice/questions?category=aptitude&limit=10
router.get('/questions', protect, async (req, res) => {
  try {
    const { category = 'aptitude', limit = 10 } = req.query;
    const questions = await Question.aggregate([
      { $match: category !== 'all' ? { category } : {} },
      { $sample: { size: parseInt(limit) } },
      { $project: { correct: 0 } }  // hide answers
    ]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/practice/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers, category, timeTaken } = req.body;
    // answers: [{questionId, selected}]
    
    let score = 0;
    const results = [];
    for (const ans of answers) {
      const q = await Question.findById(ans.questionId);
      if (!q) continue;
      const correct = q.correct === ans.selected;
      if (correct) score++;
      results.push({ questionId: ans.questionId, correct, correctAnswer: q.correct, explanation: q.explanation });
    }

    const total = answers.length;
    const percentage = total ? Math.round((score / total) * 100) : 0;

    const result = await QuizResult.create({
      student: req.user._id, category, score, total, percentage, timeTaken
    });

    // Update aptitude score in student profile if aptitude quiz
    if (category === 'aptitude') {
      await Student.findByIdAndUpdate(req.user._id, { aptitudeScore: percentage });
    }

    res.json({ score, total, percentage, results, resultId: result._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/practice/leaderboard?category=aptitude
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { category = 'aptitude' } = req.query;
    const leaderboard = await QuizResult.aggregate([
      { $match: { category } },
      { $sort: { percentage: -1, timeTaken: 1 } },
      { $group: { _id: '$student', bestScore: { $first: '$percentage' }, timeTaken: { $first: '$timeTaken' } } },
      { $sort: { bestScore: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      { $project: { name: '$student.name', bestScore: 1, timeTaken: 1 } }
    ]);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/practice/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await QuizResult.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
