import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Prediction from './pages/Prediction';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="loader">Loading...</div>;
  return user && isAdmin ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <Router>
      {user && <Navbar />}
      <div className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/prediction"    element={<PrivateRoute><Prediction /></PrivateRoute>} />
          <Route path="/resume"        element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
          <Route path="/practice"      element={<PrivateRoute><Practice /></PrivateRoute>} />
          <Route path="/leaderboard"   element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/admin"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
