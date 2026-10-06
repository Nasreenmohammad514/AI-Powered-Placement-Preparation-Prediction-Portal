import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import API from '../utils/api';

export default function Prediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/student/predict');
      setResult(data);
      toast.success('Prediction complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally { setLoading(false); }
  };

  const prob = result?.probability;
  const color = prob >= 70 ? '#10b981' : prob >= 50 ? '#f59e0b' : '#ef4444';
  const label = prob >= 70 ? '🎉 High Placement Readiness' : prob >= 50 ? '⚠️ Moderate Readiness' : '❌ Needs Significant Improvement';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🤖 ML Placement Prediction</h1>
        <p className="page-subtitle">Our Random Forest model analyzes your profile to predict placement probability</p>
      </div>

      {!result && (
        <div className="card text-center" style={{ maxWidth:500, margin:'0 auto', padding:48 }}>
          <div style={{ fontSize:'4rem', marginBottom:16 }}>🤖</div>
          <h3 style={{ marginBottom:8 }}>Ready to Predict?</h3>
          <p className="text-muted" style={{ marginBottom:24, fontSize:'0.9rem' }}>
            The ML model uses your CGPA, skills, internships, projects, certifications, and aptitude score to predict your placement readiness.
          </p>
          <p className="text-muted" style={{ marginBottom:24, fontSize:'0.85rem' }}>
            ⚠️ Make sure your <strong>Profile</strong> is updated before running the prediction.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handlePredict} disabled={loading}>
            {loading ? '⏳ Analyzing Profile...' : '🚀 Run Prediction'}
          </button>
        </div>
      )}

      {result && (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Score */}
          <div className="card text-center" style={{ padding:40 }}>
            <div style={{ fontSize:'1rem', color:'var(--text-muted)', marginBottom:16 }}>Placement Probability</div>
            <div style={{ fontSize:'5rem', fontWeight:700, color, fontFamily:'JetBrains Mono', lineHeight:1 }}>{Math.round(prob)}%</div>
            <div style={{ marginTop:12, fontSize:'1.1rem' }}>{label}</div>
            <div style={{ maxWidth:400, margin:'20px auto 0' }}>
              <div className="progress-wrap" style={{ height:16 }}>
                <div className="progress-bar" style={{ width:`${prob}%`, background:color }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop:20 }} onClick={() => { setResult(null); }}>
              Re-run Prediction
            </button>
          </div>

          <div className="grid-2 gap-24">
            {/* Weak Areas */}
            <div className="card">
              <div className="card-title">⚠️ Weak Areas Detected</div>
              {result.weakAreas?.length > 0 ? (
                <ul style={{ listStyle:'none' }}>
                  {result.weakAreas.map((a,i) => (
                    <li key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                      <span style={{ color:'var(--danger)', fontSize:'1.2rem' }}>●</span>
                      <span style={{ fontSize:'0.88rem' }}>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">✅ No major weak areas detected. Great profile!</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="card">
              <div className="card-title">💡 Improvement Recommendations</div>
              <ul style={{ listStyle:'none' }}>
                {result.recommendations?.map((r,i) => (
                  <li key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
                    <span style={{ color:'var(--primary)', fontSize:'1rem', marginTop:1 }}>→</span>
                    <span style={{ fontSize:'0.88rem' }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Recommendations */}
          {result.companies?.length > 0 && (
            <div className="card">
              <div className="card-title">🏢 Recommended Companies / Domains</div>
              <div className="grid-2 gap-16" style={{ marginTop:8 }}>
                {result.companies.map((c,i) => (
                  <div key={i} style={{ padding:16, background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ fontWeight:600, marginBottom:6 }}>{c.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:8 }}>{c.reason}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {c.roles?.map(r => <span key={r} className="tag tag-blue">{r}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
