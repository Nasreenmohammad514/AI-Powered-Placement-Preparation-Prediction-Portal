# 🎓 AI-Powered Placement Preparation & Prediction Portal

A full-stack web application that predicts student placement readiness using Machine Learning, NLP-based resume analysis, and personalized guidance.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Chart.js |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| ML Model | Python + Scikit-learn |
| NLP | Python + NLTK / TF-IDF |
| Auth | JWT |

---

## 📁 Project Structure

```
placement-portal/
├── frontend/           → React UI
├── backend/            → Node.js REST API
├── ml_model/           → Python ML + Resume Analyzer
├── database/           → DB schema & seed data
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # Fill in your MongoDB URI + JWT secret
npm run dev
```

### 2. ML Model Server
```bash
cd ml_model
pip install -r requirements.txt
python train_model.py       # Train & save the model
python app.py               # Start Flask API on port 5001
```

### 3. Frontend
```bash
cd frontend
npm install
npm start                   # Runs on port 3000
```

---

## 👥 Module Owners (Team of 4)

| Member | Module |
|--------|--------|
| Member 1 | Frontend – React UI, Dashboards, Charts |
| Member 2 | Backend – REST APIs, Auth, DB integration |
| Member 3 | ML Model, Resume Analyzer (NLP) |
| Member 4 | Database Design, Testing, Deployment |

---

## 🎯 Features

- ✅ Student Register / Login (JWT Auth)
- ✅ Profile: CGPA, Skills, Internships, Projects
- ✅ Placement Probability Prediction (ML)
- ✅ Resume Score Analyzer (NLP / keyword scoring)
- ✅ Company Recommendations (rule-based)
- ✅ Aptitude MCQ Practice with timer
- ✅ Leaderboard
- ✅ Admin Dashboard with charts
- ✅ Skill Gap Analysis

---

## 📊 ML Model

- **Algorithm**: Random Forest Classifier (also includes Logistic Regression, XGBoost)
- **Features**: CGPA, skill count, internships, projects, aptitude score
- **Output**: Placement probability (0–100%)
- **Dataset**: Synthetic (500 rows) – see `ml_model/generate_dataset.py`

---

## 📝 Resume Analyzer

- Extracts text from PDF uploads
- Scores based on: technical keywords, action verbs, project mentions
- Compares against ideal template
- Output: Score out of 100 + missing skills

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login & get token |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/profile` | Get own profile |
| PUT | `/api/student/profile` | Update profile |
| POST | `/api/student/predict` | Get ML prediction |
| POST | `/api/student/resume` | Upload & score resume |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/students` | All students |
| GET | `/api/admin/analytics` | Dashboard analytics |

### Practice
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/practice/questions` | Fetch MCQs |
| POST | `/api/practice/submit` | Submit quiz |
| GET | `/api/practice/leaderboard` | Leaderboard |
