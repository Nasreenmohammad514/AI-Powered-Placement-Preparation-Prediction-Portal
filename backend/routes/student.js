const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `resume_${req.user._id}_${Date.now()}.pdf`)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
});

// GET /api/student/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/student/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const fields = ['name', 'cgpa', 'branch', 'graduationYear', 'skills',
                    'internshipCount', 'projectCount', 'certificationCount', 'aptitudeScore'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const student = await Student.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/predict  →  calls Python ML API
router.post('/predict', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const payload = {
      cgpa: student.cgpa,
      skills_count: student.skills.length,
      internship_count: student.internshipCount,
      project_count: student.projectCount,
      certification_count: student.certificationCount,
      aptitude_score: student.aptitudeScore
    };

    let probability = 50;
    let weakAreas = [];
    let recommendations = [];

    try {
      const mlRes = await axios.post(`${process.env.ML_API_URL}/predict`, payload, { timeout: 5000 });
      probability = mlRes.data.probability;
      weakAreas = mlRes.data.weak_areas || [];
      recommendations = mlRes.data.recommendations || [];
    } catch {
      // Fallback: rule-based scoring if ML server not running
      let score = 0;
      if (student.cgpa >= 8.5) score += 30;
      else if (student.cgpa >= 7.5) score += 22;
      else if (student.cgpa >= 6.5) score += 14;
      else score += 5;

      score += Math.min(student.skills.length * 5, 25);
      score += Math.min(student.internshipCount * 8, 20);
      score += Math.min(student.projectCount * 3, 15);
      score += Math.min(student.aptitudeScore * 0.1, 10);
      probability = Math.min(Math.round(score), 98);

      if (student.cgpa < 7) weakAreas.push('CGPA (aim for 7+)');
      if (student.skills.length < 5) weakAreas.push('Technical Skills (add more)');
      if (student.internshipCount === 0) weakAreas.push('Internship Experience');
      if (student.aptitudeScore < 60) weakAreas.push('Aptitude Score');
      if (student.projectCount < 2) weakAreas.push('Projects (build 2-3 projects)');

      if (student.skills.length < 5) recommendations.push('Learn DSA and at least one core language deeply');
      if (student.internshipCount === 0) recommendations.push('Apply for internships on Internshala / LinkedIn');
      if (student.aptitudeScore < 60) recommendations.push('Practice aptitude tests daily (30 min)');
      recommendations.push('Build a strong GitHub profile with 3+ projects');
      recommendations.push('Prepare HR questions and mock interviews');
    }

    // Save to student document
    await Student.findByIdAndUpdate(req.user._id, { placementProbability: probability, weakAreas, recommendations });

    // Company recommendations (rule-based)
    const companies = getCompanyRecommendations(student.skills);

    res.json({ probability, weakAreas, recommendations, companies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/resume  →  upload and analyze resume
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let resumeData = { score: 50, missing: [] };
    try {
      const formData = new (require('form-data'))();
      formData.append('resume', fs.createReadStream(req.file.path));
      const mlRes = await axios.post(`${process.env.ML_API_URL}/resume`, formData, {
        headers: formData.getHeaders(), timeout: 10000
      });
      resumeData = mlRes.data;
    } catch {
      // Fallback resume scoring
      resumeData = { score: 55, missing: ['Action verbs', 'Quantified achievements', 'Technical keywords'] };
    }

    await Student.findByIdAndUpdate(req.user._id, {
      resumePath: req.file.filename,
      resumeScore: resumeData.score
    });

    res.json({ score: resumeData.score, missing: resumeData.missing, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: Rule-based company recommendations
function getCompanyRecommendations(skills) {
  const s = skills.map(x => x.toLowerCase());
  const companies = [];

  const has = (...k) => k.some(x => s.includes(x));

  if (has('java', 'dsa', 'algorithms'))
    companies.push({ name: 'Product Companies (FAANG)', reason: 'Strong DSA + Java background', roles: ['SDE', 'Backend Engineer'] });
  if (has('python', 'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch'))
    companies.push({ name: 'AI/ML Startups & Labs', reason: 'Python + ML expertise', roles: ['ML Engineer', 'Data Scientist'] });
  if (has('react', 'javascript', 'html', 'css', 'frontend'))
    companies.push({ name: 'Frontend-focused Startups', reason: 'React/JS skills', roles: ['Frontend Developer', 'UI Engineer'] });
  if (has('node', 'nodejs', 'express', 'mongodb'))
    companies.push({ name: 'Full-Stack Product Companies', reason: 'MERN Stack proficiency', roles: ['Full Stack Developer'] });
  if (has('sql', 'database', 'mysql', 'postgresql'))
    companies.push({ name: 'Data Analytics Companies', reason: 'Database expertise', roles: ['Data Analyst', 'Database Engineer'] });
  if (has('aws', 'azure', 'cloud', 'docker', 'kubernetes'))
    companies.push({ name: 'Cloud & DevOps Companies', reason: 'Cloud/DevOps skills', roles: ['Cloud Engineer', 'DevOps Engineer'] });

  if (companies.length === 0)
    companies.push({ name: 'Service Companies (TCS, Infosys, Wipro)', reason: 'General IT profile', roles: ['Software Engineer', 'Analyst'] });

  return companies;
}

module.exports = router;
