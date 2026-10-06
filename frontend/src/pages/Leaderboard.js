import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['aptitude','reasoning','verbal','coding'];

export default function Leaderboard() {
  const [category, setCategory] = useState('aptitude');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    API.get(`/practice/leaderboard?category=${category}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  const rankIcon = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">Top performers across all practice categories</p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {CATEGORIES.map(c => (
          <button key={c} className={`btn ${category===c?'btn-primary':'btn-secondary'}`}
            style={{ textTransform:'capitalize' }} onClick={()=>setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loader">Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Best Score</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted" style={{ padding:40 }}>
                    No results yet. Be the first! 🚀
                  </td></tr>
                )}
                {data.map((row, i) => (
                  <tr key={i} style={{ background: row.name === user?.name ? 'rgba(99,102,241,0.1)' : '' }}>
                    <td style={{ fontSize:'1.2rem', fontWeight:700 }}>{rankIcon(i)}</td>
                    <td>
                      <span style={{ fontWeight:600 }}>{row.name}</span>
                      {row.name === user?.name && <span className="tag tag-blue" style={{ marginLeft:8 }}>You</span>}
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: row.bestScore>=70?'var(--success)':row.bestScore>=50?'var(--warning)':'var(--danger)', fontWeight:600 }}>
                        {row.bestScore}%
                      </span>
                    </td>
                    <td className="text-muted font-mono" style={{ fontSize:'0.85rem' }}>
                      {row.timeTaken ? `${Math.floor(row.timeTaken/60)}:${String(row.timeTaken%60).padStart(2,'0')}` : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
