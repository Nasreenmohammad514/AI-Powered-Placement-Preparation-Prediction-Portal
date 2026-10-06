import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="nav-brand">
        🎓 PlacementAI
      </NavLink>

      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/prediction">Predict</NavLink>
        <NavLink to="/resume">Resume</NavLink>
        <NavLink to="/practice">Practice</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </div>

      <div className="nav-right">
        <span className="nav-user">👤 {user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
