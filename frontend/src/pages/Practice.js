import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const CATEGORIES = ['aptitude','reasoning','verbal','coding'];

export default function Practice() {
  const [category, setCategory] = useState('aptitude');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [timeTaken, setTimeTaken] = useState(0);
  const startTime = useRef(null);
  const timerRef = useRef(null);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/practice/questions?category=${category}&limit=10`);
      if (!data.length) return toast.error('No questions found. Please seed the database first.');
      setQuestions(data);
      setAnswers({});
      setSubmitted(false);
      setResults(null);
      setTimeLeft(600);
      setStarted(true);
      startTime.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  const handleSelect = (qId, optIndex) => {
    if (!submitted) setAnswers(a => ({ ...a, [qId]: optIndex }));
  };

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    const taken = Math.round((Date.now() - (startTime.current || Date.now())) / 1000);
    setTimeTaken(taken);
    setSubmitted(true);
    const payload = {
      category,
      timeTaken: taken,
      answers: questions.map(q => ({ questionId: q._id, selected: answers[q._id] ?? -1 }))
    };
    try {
      const { data } = await API.post('/practice/submit', payload);
      setResults(data);
      if (!auto) toast.success(`Quiz submitted! Score: ${data.score}/${data.total}`);
    } catch { toast.error('Submit failed'); }
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const getOptionClass = (q, optIdx) => {
    if (!submitted) return answers[q._id] === optIdx ? 'quiz-option selected' : 'quiz-option';
    const res = results?.results?.find(r => r.questionId === q._id);
    if (!res) return 'quiz-option';
    if (res.correctAnswer === optIdx) return 'quiz-option correct';
    if (answers[q._id] === optIdx && !res.correct) return 'quiz-option wrong';
    return 'quiz-option';
  };

  if (!started) return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📝 Aptitude & Coding Practice</h1>
        <p className="page-subtitle">10 questions · 10 minute timer · Instant evaluation</p>
      </div>
      <div className="card" style={{ maxWidth:500, margin:'0 auto', padding:40 }}>
        <div style={{ fontSize:'3rem', textAlign:'center', marginBottom:20 }}>🎯</div>
        <div className="form-group">
          <label className="form-label">Select Category</label>
          <select className="form-input" value={category} onChange={e=>setCategory(e.target.value)}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ background:'var(--bg2)', borderRadius:8, padding:16, marginBottom:20, fontSize:'0.85rem', color:'var(--text-muted)' }}>
          <div>📌 10 questions per quiz</div>
          <div>⏱️ 10 minute time limit</div>
          <div>✅ Auto-evaluate on submit</div>
          <div>🏆 Best score updates leaderboard</div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width:'100%' }} onClick={startQuiz} disabled={loading}>
          {loading ? 'Loading...' : '▶ Start Quiz'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ textTransform:'capitalize' }}>{category} Quiz</h2>
          <p className="text-muted" style={{ fontSize:'0.85rem' }}>{Object.keys(answers).length}/{questions.length} answered</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className={`font-mono`} style={{ fontSize:'1.5rem', color: timeLeft < 60 ? 'var(--danger)' : 'var(--text)', fontWeight:600 }}>
            ⏱ {fmt(timeLeft)}
          </div>
          {!submitted && (
            <button className="btn btn-primary" onClick={() => handleSubmit(false)}
              disabled={Object.keys(answers).length === 0}>
              Submit
            </button>
          )}
        </div>
      </div>

      {submitted && results && (
        <div className="card" style={{ marginBottom:24, textAlign:'center', padding:32 }}>
          <div style={{ fontSize:'3rem', fontWeight:700, color: results.percentage>=70?'var(--success)':results.percentage>=50?'var(--warning)':'var(--danger)', fontFamily:'JetBrains Mono' }}>
            {results.score}/{results.total}
          </div>
          <div style={{ fontSize:'1.2rem', margin:'8px 0' }}>{results.percentage}% Score</div>
          <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Time taken: {fmt(timeTaken)}</div>
          <div style={{ marginTop:16, display:'flex', gap:12, justifyContent:'center' }}>
            <button className="btn btn-primary" onClick={()=>{ setStarted(false); }}>Try Again</button>
          </div>
        </div>
      )}

      {questions.map((q,qi) => {
        const res = submitted ? results?.results?.find(r => r.questionId === q._id) : null;
        return (
          <div className="card" key={q._id} style={{ marginBottom:16 }}>
            <div style={{ fontWeight:600, marginBottom:12, fontSize:'0.95rem' }}>
              <span className="text-muted" style={{ marginRight:8 }}>Q{qi+1}.</span>{q.question}
            </div>
            {q.options.map((opt, oi) => (
              <div key={oi} className={getOptionClass(q,oi)} onClick={()=>handleSelect(q._id,oi)}>
                <span style={{ marginRight:10, fontWeight:600, fontFamily:'JetBrains Mono' }}>
                  {['A','B','C','D'][oi]}.
                </span>{opt}
              </div>
            ))}
            {submitted && res && !res.correct && res.explanation && (
              <div style={{ marginTop:8, padding:'8px 12px', background:'rgba(16,185,129,0.1)', borderRadius:6, fontSize:'0.82rem', color:'#6ee7b7' }}>
                💡 {res.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
