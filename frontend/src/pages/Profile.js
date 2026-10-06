import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const SKILL_SUGGESTIONS = ['Python','Java','C++','JavaScript','React','Node.js','SQL','MongoDB',
  'Machine Learning','DSA','HTML','CSS','Git','Docker','AWS','Django','Flask','TypeScript','Kotlin','Swift'];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name:'',cgpa:'',branch:'',graduationYear:'',internshipCount:0,projectCount:0,certificationCount:0,aptitudeScore:0 });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/student/profile').then(r => {
      const p = r.data;
      setProfile(p);
      setForm({ name: p.name||'', cgpa: p.cgpa||'', branch: p.branch||'', graduationYear: p.graduationYear||'',
                internshipCount: p.internshipCount||0, projectCount: p.projectCount||0,
                certificationCount: p.certificationCount||0, aptitudeScore: p.aptitudeScore||0 });
      setSkills(p.skills || []);
    }).finally(() => setLoading(false));
  }, []);

  const addSkill = (sk) => {
    const trimmed = sk.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (sk) => setSkills(skills.filter(s => s !== sk));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
    if (e.key === 'Backspace' && !skillInput && skills.length) setSkills(skills.slice(0,-1));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/student/profile', { ...form, skills });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loader">Loading profile...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile updated for accurate predictions</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid-2 gap-24">
          {/* Personal Info */}
          <div className="card">
            <div className="card-title">👤 Personal Information</div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Branch / Department</label>
              <select className="form-input" value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>
                <option value="">Select Branch</option>
                {['CSE','ECE','EEE','ME','CE','IT','MCA','MBA','Other'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <select className="form-input" value={form.graduationYear} onChange={e=>setForm({...form,graduationYear:e.target.value})}>
                {[2024,2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Academic */}
          <div className="card">
            <div className="card-title">📚 Academic Details</div>
            <div className="form-group">
              <label className="form-label">CGPA (out of 10)</label>
              <input className="form-input" type="number" step="0.01" min="0" max="10"
                value={form.cgpa} onChange={e=>setForm({...form,cgpa:e.target.value})} placeholder="e.g. 8.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Internships Completed</label>
              <input className="form-input" type="number" min="0" value={form.internshipCount}
                onChange={e=>setForm({...form,internshipCount:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Projects Built</label>
              <input className="form-input" type="number" min="0" value={form.projectCount}
                onChange={e=>setForm({...form,projectCount:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Certifications</label>
              <input className="form-input" type="number" min="0" value={form.certificationCount}
                onChange={e=>setForm({...form,certificationCount:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Aptitude Score (0–100)</label>
              <input className="form-input" type="number" min="0" max="100" value={form.aptitudeScore}
                onChange={e=>setForm({...form,aptitudeScore:e.target.value})} />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card mt-24">
          <div className="card-title">💡 Technical Skills</div>
          <p className="text-muted" style={{ fontSize:'0.85rem', marginBottom:12 }}>
            Press Enter or comma to add a skill. These are used in ML prediction & company matching.
          </p>
          <div className="skill-tags-input" onClick={()=>document.getElementById('skillInput').focus()}>
            {skills.map(sk => (
              <span key={sk} className="tag tag-blue" style={{ cursor:'pointer' }} onClick={()=>removeSkill(sk)}>
                {sk} ✕
              </span>
            ))}
            <input id="skillInput" value={skillInput} onChange={e=>setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder={skills.length===0?'Type a skill and press Enter...':''} />
          </div>
          <div style={{ marginTop:12 }}>
            <p className="text-muted" style={{ fontSize:'0.78rem', marginBottom:8 }}>Quick add:</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {SKILL_SUGGESTIONS.filter(s=>!skills.includes(s)).slice(0,12).map(s=>(
                <span key={s} className="tag tag-blue" style={{ cursor:'pointer' }} onClick={()=>addSkill(s)}>{s} +</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
          <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
