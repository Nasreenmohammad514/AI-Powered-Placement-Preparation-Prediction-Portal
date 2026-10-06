const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const student = await Student.create({ name, email, password, role: role || 'student' });
    res.status(201).json({ token: generateToken(student._id), user: { id: student._id, name, email, role: student.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !(await student.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(student._id), user: { id: student._id, name: student.name, email, role: student.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
