"""
Flask ML API Server
Run: python app.py
Serves ML predictions and resume analysis on port 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import re
import io

app = Flask(__name__)
CORS(app)

# ── Load ML model ─────────────────────────────────────────────────────────────
MODEL_PATH    = 'model.pkl'
FEATURES_PATH = 'features.pkl'

model    = None
features = None

if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
    model    = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURES_PATH)
    print("✅ ML model loaded")
else:
    print("⚠️  model.pkl not found. Run train_model.py first.")

# ── Keyword lists for resume analysis ────────────────────────────────────────
TECH_KEYWORDS = [
    'python', 'java', 'javascript', 'c++', 'c#', 'sql', 'html', 'css', 'react',
    'node', 'angular', 'vue', 'django', 'flask', 'spring', 'machine learning',
    'deep learning', 'tensorflow', 'pytorch', 'docker', 'kubernetes', 'aws',
    'azure', 'git', 'github', 'rest api', 'mongodb', 'mysql', 'postgresql',
    'data structures', 'algorithms', 'dsa', 'linux', 'hadoop', 'spark', 'tableau',
    'power bi', 'figma', 'redux', 'typescript', 'graphql', 'microservices'
]

ACTION_VERBS = [
    'developed', 'built', 'designed', 'implemented', 'created', 'led', 'managed',
    'optimized', 'improved', 'achieved', 'delivered', 'automated', 'integrated',
    'deployed', 'trained', 'analyzed', 'collaborated', 'engineered', 'launched'
]

SECTION_KEYWORDS = [
    'education', 'experience', 'projects', 'skills', 'certifications', 'internship',
    'achievements', 'summary', 'objective', 'publications', 'awards', 'languages'
]

def analyze_resume_text(text: str) -> dict:
    text_lower = text.lower()
    words = set(re.findall(r'\b\w+\b', text_lower))

    tech_found  = [kw for kw in TECH_KEYWORDS if kw in text_lower]
    verbs_found = [v  for v  in ACTION_VERBS   if v  in text_lower]
    secs_found  = [s  for s  in SECTION_KEYWORDS if s in text_lower]

    # Quantified achievements (numbers followed by % or keywords)
    quant_pattern = re.findall(r'\d+\s*(%|percent|x|times|users|students|projects)', text_lower)

    # Scoring
    tech_score  = min(len(tech_found)  / 10 * 40, 40)   # max 40 pts
    verb_score  = min(len(verbs_found) / 8  * 20, 20)   # max 20 pts
    sec_score   = min(len(secs_found)  / 6  * 20, 20)   # max 20 pts
    quant_score = min(len(quant_pattern) * 4,      10)  # max 10 pts
    length_ok   = 10 if 300 < len(text.split()) < 1000 else 5  # ideal 1-page resume

    total_score = int(tech_score + verb_score + sec_score + quant_score + length_ok)

    # Missing suggestions
    missing = []
    if len(tech_found) < 5:
        missing.append('More technical keywords/skills (e.g., Python, SQL, React)')
    if len(verbs_found) < 4:
        missing.append('Strong action verbs (Developed, Built, Optimized...)')
    if 'projects' not in text_lower:
        missing.append('Projects section')
    if not quant_pattern:
        missing.append('Quantified achievements (e.g., improved performance by 30%)')
    if 'internship' not in text_lower and 'experience' not in text_lower:
        missing.append('Experience / Internship section')
    if len(text.split()) > 1000:
        missing.append('Resume is too long – keep it to 1 page')

    return {
        'score': total_score,
        'tech_keywords_found': tech_found,
        'action_verbs_found': verbs_found,
        'sections_found': secs_found,
        'missing': missing,
        'word_count': len(text.split())
    }

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ML API running ✅', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not trained yet. Run train_model.py'}), 503

    data = request.get_json()
    required = ['cgpa', 'skills_count', 'internship_count', 'project_count',
                'certification_count', 'aptitude_score']

    for f in required:
        if f not in data:
            return jsonify({'error': f'Missing field: {f}'}), 400

    X = np.array([[data[f] for f in features]])
    prob_val = float(model.predict_proba(X)[0][1]) * 100
    probability = round(prob_val, 1)

    # Derive weak areas
    weak_areas = []
    recs = []
    if data['cgpa'] < 7:
        weak_areas.append('CGPA (aim for 7.0+)')
        recs.append('Focus on academics; aim for 7+ CGPA this semester')
    if data['skills_count'] < 5:
        weak_areas.append('Technical Skills (too few)')
        recs.append('Learn DSA fundamentals + 1 programming language deeply')
    if data['internship_count'] == 0:
        weak_areas.append('Internship Experience (none)')
        recs.append('Apply to internships on Internshala, LinkedIn, AngelList')
    if data['project_count'] < 2:
        weak_areas.append('Projects (build more)')
        recs.append('Create 2-3 projects and host them on GitHub')
    if data['aptitude_score'] < 60:
        weak_areas.append('Aptitude Score (below 60%)')
        recs.append('Practice aptitude tests daily – target 80%+')
    if data['certification_count'] == 0:
        weak_areas.append('Certifications (none)')
        recs.append('Get certified on Coursera, Udemy, or NPTEL')

    recs.append('Practice mock interviews (Pramp, InterviewBit)')
    recs.append('Maintain an updated LinkedIn profile with all projects')

    return jsonify({'probability': probability, 'weak_areas': weak_areas, 'recommendations': recs})

@app.route('/resume', methods=['POST'])
def resume_score():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files supported'}), 400

    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''

        if not text.strip():
            return jsonify({'score': 30, 'missing': ['Could not extract text from PDF. Use a text-based PDF, not a scanned image.']})

        result = analyze_resume_text(text)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    """Analyze resume text directly (for testing)"""
    data = request.get_json()
    if 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    result = analyze_resume_text(data['text'])
    return jsonify(result)

if __name__ == '__main__':
    print("🚀 Starting ML API on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
