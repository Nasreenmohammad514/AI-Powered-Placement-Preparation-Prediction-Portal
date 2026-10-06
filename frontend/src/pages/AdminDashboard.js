import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import API from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color:'#94a3b8' }, grid: { color:'#2d2d4e' } }, y: { ticks: { color:'#94a3b8' }, grid: { color:'#2d2d4e' } } } };
const donutOpts = { responsive: true, plugins: { legend: { position:'bottom', labels:{ color:'#94a3b8', padding:16 } } } };

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([API.get('/admin/analytics'), API.get('/admin/students')])
      .then(([a, s]) => { setAnalytics(a.data); setStudents(s.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Loading admin dashboard...</div>;

  const { total, placed, avgCgpa, avgScore, topSkills, distribution, cgpaRanges } = analytics;

  const distChart = {
    labels: ['Low (<40%)', 'Medium (40-60%)', 'High (60-80%)', 'Very High (80%+)'],
    datasets: [{ data: [distribution.low, distribution.medium, distribution.high, distribution.veryHigh],
      backgroundColor: ['#ef444466','#f59e0b66','#6366f166','#10b98166'],
      borderColor: ['#ef4444','#f59e0b','#6366f1','#10b981'], borderWidth:2 }]
  };

  const cgpaChart = {
    labels: Object.keys(cgpaRanges),
    datasets: [{ label:'Students', data: Object.values(cgpaRanges), backgroundColor:'#6366f166', borderColor:'#6366f1', borderWidth:2 }]
  };

  const skillChart = {
    labels: topSkills.slice(0,8).map(([k])=>k),
    datasets: [{ label:'Students with skill', data: topSkills.slice(0,8).map(([,v])=>v), backgroundColor:'#06b6d466', borderColor:'#06b6d4', borderWidth:2 }]
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👨‍💼 Admin Dashboard</h1>
        <p className="page-subtitle">Placement cell analytics & student readiness overview</p>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { icon:'👥', label:'Total Students', value:total, color:'var(--primary)' },
          { icon:'✅', label:'Placement Ready (70%+)', value:placed, color:'var(--success)' },
          { icon:'📊', label:'Avg CGPA', value:avgCgpa, color:'var(--secondary)' },
          { icon:'🎯', label:'Avg Readiness', value:`${avgScore}%`, color:'var(--warning)' },
        ].map(s=>(
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid-2 gap-24" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="card-title">📊 Placement Readiness Distribution</div>
          <Doughnut data={distChart} options={donutOpts} />
        </div>
        <div className="card">
          <div className="card-title">🎓 CGPA Distribution</div>
          <Bar data={cgpaChart} options={chartOpts} />
        </div>
      </div>

      {/* Top Skills */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-title">💡 Top Skills Among Students</div>
        <Bar data={skillChart} options={chartOpts} />
      </div>

      {/* Students Table */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div className="card-title" style={{ marginBottom:0 }}>👨‍🎓 All Students ({students.length})</div>
          <input className="form-input" style={{ width:240 }} placeholder="Search by name or email..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Branch</th><th>CGPA</th><th>Skills</th>
                <th>Internships</th><th>Projects</th><th>Readiness</th><th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0,50).map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td className="text-muted">{s.branch||'–'}</td>
                  <td className="font-mono">{s.cgpa||'–'}</td>
                  <td>{s.skills?.length || 0}</td>
                  <td>{s.internshipCount||0}</td>
                  <td>{s.projectCount||0}</td>
                  <td>
                    {s.placementProbability != null ? (
                      <span style={{ color: s.placementProbability>=70?'var(--success)':s.placementProbability>=50?'var(--warning)':'var(--danger)', fontWeight:600, fontFamily:'JetBrains Mono' }}>
                        {Math.round(s.placementProbability)}%
                      </span>
                    ) : <span className="text-muted">–</span>}
                  </td>
                  <td>
                    {s.resumeScore != null ? (
                      <span className="tag" style={{ background: s.resumeScore>=70?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)', color: s.resumeScore>=70?'#6ee7b7':'#fcd34d' }}>
                        {s.resumeScore}/100
                      </span>
                    ) : <span className="text-muted">–</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
