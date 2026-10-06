import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else toast.error('Only PDF files supported');
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Select a PDF first');
    setLoading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await API.post('/student/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const score = result?.score;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📄 Resume Analyzer</h1>
        <p className="page-subtitle">NLP-powered resume scoring — get instant feedback on your resume</p>
      </div>

      {/* Upload */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-title">Upload Resume (PDF)</div>
        <div
          onDrop={handleDrop}
          onDragOver={e=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onClick={()=>inputRef.current.click()}
          style={{
            border:`2px dashed ${drag?'var(--primary)':'var(--border)'}`,
            borderRadius:12, padding:'40px 20px', textAlign:'center', cursor:'pointer',
            background: drag?'rgba(99,102,241,0.08)':'var(--bg2)', transition:'all 0.2s'
          }}
        >
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📂</div>
          {file ? (
            <p style={{ color:'var(--success)' }}>✅ {file.name} ({(file.size/1024).toFixed(1)} KB)</p>
          ) : (
            <>
              <p style={{ marginBottom:4 }}>Drag & drop your resume PDF here</p>
              <p className="text-muted" style={{ fontSize:'0.85rem' }}>or click to browse</p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".pdf" style={{ display:'none' }}
            onChange={e=>{ if(e.target.files[0]) setFile(e.target.files[0]); }} />
        </div>

        <div style={{ marginTop:16, display:'flex', gap:12 }}>
          <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file||loading}>
            {loading ? '⏳ Analyzing...' : '🔍 Analyze Resume'}
          </button>
          {file && <button className="btn btn-secondary" onClick={()=>{ setFile(null); setResult(null); }}>Clear</button>}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Score */}
          <div className="card text-center" style={{ padding:36 }}>
            <div className="text-muted" style={{ marginBottom:12 }}>Resume Score</div>
            <div style={{ fontSize:'4.5rem', fontWeight:700, color, fontFamily:'JetBrains Mono', lineHeight:1 }}>
              {score}<span style={{ fontSize:'2rem' }}>/100</span>
            </div>
            <div style={{ marginTop:8 }}>
              {score >= 70 ? '🎉 Strong Resume!' : score >= 50 ? '⚠️ Good but improvable' : '❌ Needs significant work'}
            </div>
            <div style={{ maxWidth:400, margin:'16px auto 0' }}>
              <div className="progress-wrap"><div className="progress-bar" style={{ width:`${score}%`, background:color }} /></div>
            </div>
          </div>

          <div className="grid-2 gap-20">
            {/* Keywords found */}
            {result.tech_keywords_found?.length > 0 && (
              <div className="card">
                <div className="card-title">✅ Technical Keywords Found ({result.tech_keywords_found.length})</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {result.tech_keywords_found.map(k=><span key={k} className="tag tag-green">{k}</span>)}
                </div>
              </div>
            )}

            {/* Action verbs */}
            {result.action_verbs_found?.length > 0 && (
              <div className="card">
                <div className="card-title">✅ Action Verbs Found ({result.action_verbs_found.length})</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {result.action_verbs_found.map(v=><span key={v} className="tag tag-blue">{v}</span>)}
                </div>
              </div>
            )}

            {/* Missing / suggestions */}
            {result.missing?.length > 0 && (
              <div className="card">
                <div className="card-title">❌ Missing / Suggestions</div>
                <ul style={{ listStyle:'none' }}>
                  {result.missing.map((m,i)=>(
                    <li key={i} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.88rem' }}>
                      <span style={{ color:'var(--danger)' }}>●</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div className="card">
              <div className="card-title">📊 Resume Stats</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                  <span className="text-muted">Word Count</span>
                  <span className="font-mono">{result.word_count}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                  <span className="text-muted">Sections Detected</span>
                  <span className="font-mono">{result.sections_found?.length || 0}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                  <span className="text-muted">Tech Keywords</span>
                  <span className="font-mono">{result.tech_keywords_found?.length || 0}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                  <span className="text-muted">Action Verbs</span>
                  <span className="font-mono">{result.action_verbs_found?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
