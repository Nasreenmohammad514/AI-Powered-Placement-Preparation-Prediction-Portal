const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');

// GET /api/admin/students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' }).select('-password').sort({ placementProbability: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' });

    const total = students.length;
    const placed = students.filter(s => (s.placementProbability || 0) >= 70).length;
    const avgCgpa = total ? (students.reduce((a, b) => a + b.cgpa, 0) / total).toFixed(2) : 0;
    const avgScore = total ? (students.reduce((a, b) => a + (b.placementProbability || 0), 0) / total).toFixed(1) : 0;

    // Skill frequency
    const skillMap = {};
    students.forEach(s => s.skills.forEach(sk => { skillMap[sk] = (skillMap[sk] || 0) + 1; }));
    const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Readiness distribution
    const distribution = { low: 0, medium: 0, high: 0, veryHigh: 0 };
    students.forEach(s => {
      const p = s.placementProbability || 0;
      if (p < 40) distribution.low++;
      else if (p < 60) distribution.medium++;
      else if (p < 80) distribution.high++;
      else distribution.veryHigh++;
    });

    // CGPA distribution
    const cgpaRanges = { 'Below 6': 0, '6-7': 0, '7-8': 0, '8-9': 0, 'Above 9': 0 };
    students.forEach(s => {
      if (s.cgpa < 6) cgpaRanges['Below 6']++;
      else if (s.cgpa < 7) cgpaRanges['6-7']++;
      else if (s.cgpa < 8) cgpaRanges['7-8']++;
      else if (s.cgpa < 9) cgpaRanges['8-9']++;
      else cgpaRanges['Above 9']++;
    });

    res.json({ total, placed, avgCgpa, avgScore, topSkills, distribution, cgpaRanges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/top-students?limit=10
router.get('/top-students', protect, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const students = await Student.find({ role: 'student', placementProbability: { $ne: null } })
      .select('name cgpa skills placementProbability branch')
      .sort({ placementProbability: -1 })
      .limit(limit);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
