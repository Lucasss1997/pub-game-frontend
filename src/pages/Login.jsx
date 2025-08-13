// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('new@pub.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { token } = await api.post('/api/login', { email, password });
      if (token) localStorage.setItem('token', token); // also keep it in localStorage
      navigate('/dashboard');
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    }
  }

  async function ensureUserOnce() {
    setErr('');
    try {
      await api.post('/api/dev/ensure-user', { email, password });
      setErr('User ensured. Try logging in again.');
    } catch (e2) {
      setErr(e2.message || 'Ensure failed');
    }
  }

  return (
    <div className="pg-screen">
      <form className="pg-card" onSubmit={onSubmit}>
        <h1 className="pg-title">Sign In</h1>
        {err && <div className="pg-alert">{err}</div>}
        <input
          className="pg-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
        />
        <input
          className="pg-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="pg-actions">
          <button className="pg-button" type="submit">Login</button>
          <button type="button" className="pg-button ghost" onClick={ensureUserOnce}>
            Ensure user (once)
          </button>
        </div>
      </form>
    </div>
  );
}