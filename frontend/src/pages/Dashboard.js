import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ScoreGauge = ({ value }) => {
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  const label = value >= 70 ? 'High Readiness' : value >= 50 ? 'Moderate' : 'Needs Work';
  return (
    <div className="text-center">
      <div className="score-circle" style={{ borderColor: color }}>
        <span style={{ color }}>{value ?? '--'}</span>
        <small>%</small>
      </div>
      <span className="tag" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/profile').then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Loading dashboard...</div>;

  const prob = profile?.placementProbability;

  const quickStats = [
    { icon: '📊', label: 'CGPA', value: profile?.cgpa || '–', sub: 'out of 10' },
    { icon: '💡', label: 'Skills', value: profile?.skills?.length || 0, sub: 'added' },
    { icon: '🏢', label: 'Internships', value: profile?.internshipCount || 0, sub: 'completed' },
    { icon: '🛠️', label: 'Projects', value: profile?.projectCount || 0, sub: 'built' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your placement readiness overview</p>
      </div>

      <div className="grid-4 mb-16">
        {quickStats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label} · {s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 gap-24">
        {/* Placement Score */}
        <div className="card">
          <div className="card-title">🎯 Placement Probability</div>
          {prob != null ? (
            <>
              <ScoreGauge value={Math.round(prob)} />
              <div className="mt-16">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Readiness</span><span>{Math.round(prob)}%</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar" style={{ width: `${prob}%`, background: prob >= 70 ? 'var(--success)' : prob >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center" style={{ padding: '20px 0' }}>
              <p className="text-muted" style={{ marginBottom: 16 }}>Run your placement prediction to see your score</p>
              <Link to="/prediction" className="btn btn-primary">Get Prediction →</Link>
            </div>
          )}
        </div>

        {/* Resume Score */}
        <div className="card">
          <div className="card-title">📄 Resume Score</div>
          {profile?.resumeScore != null ? (
            <>
              <ScoreGauge value={profile.resumeScore} />
              <p className="text-muted text-center mt-8" style={{ fontSize: '0.85rem' }}>
                {profile.resumeScore >= 70 ? '✅ Strong resume!' : profile.resumeScore >= 50 ? '⚠️ Resume needs improvement' : '❌ Resume needs significant work'}
              </p>
              <div className="text-center mt-16">
                <Link to="/resume" className="btn btn-secondary">Analyze Again</Link>
              </div>
            </>
          ) : (
            <div className="text-center" style={{ padding: '20px 0' }}>
              <p className="text-muted" style={{ marginBottom: 16 }}>Upload your resume to get an AI-powered score</p>
              <Link to="/resume" className="btn btn-primary">Analyze Resume →</Link>
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="card">
          <div className="card-title">⚠️ Areas to Improve</div>
          {profile?.weakAreas?.length > 0 ? (
            <ul style={{ listStyle: 'none' }}>
              {profile.weakAreas.map((a, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--danger)' }}>●</span> {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.88rem' }}>
              {prob != null ? '✅ No major weak areas detected!' : 'Run prediction to identify weak areas'}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title">⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/profile', icon: '✏️', label: 'Update Profile & Skills' },
              { to: '/prediction', icon: '🤖', label: 'Run ML Prediction' },
              { to: '/resume', icon: '📄', label: 'Analyze Resume' },
              { to: '/practice', icon: '📝', label: 'Practice Aptitude Test' },
              { to: '/leaderboard', icon: '🏆', label: 'View Leaderboard' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <span>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {profile?.recommendations?.length > 0 && (
        <div className="card mt-24">
          <div className="card-title">💡 Personalized Recommendations</div>
          <div className="grid-2">
            {profile.recommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px', background: 'var(--bg2)', borderRadius: 8 }}>
                <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>→</span>
                <span style={{ fontSize: '0.88rem' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
