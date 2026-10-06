import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Start your placement journey today</p>

        <form onSubmit={handleSubmit}>
          {['name','email','password','confirm'].map(field => (
            <div className="form-group" key={field}>
              <label className="form-label">{field === 'confirm' ? 'Confirm Password' : field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input className="form-input"
                type={field.includes('password') || field === 'confirm' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field === 'name' ? 'Full Name' : field === 'email' ? 'you@college.edu' : '••••••••'}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required />
            </div>
          ))}
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
