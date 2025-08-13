// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, setToken } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('new@pub.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { token } = await post('/api/login', { email, password });
      setToken(token);
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    }
  }

  async function ensureUserOnce() {
    setErr('');
    try {
      await post('/api/register', { email, password: password || 'changeme', pubName: 'New Pub' });
      setErr('User ensured. Try logging in again.');
    } catch (e) {
      setErr(e.message || 'Failed to ensure user');
    }
  }

  return (
    <div className="page-wrap">
      <div className="card">
        <h1 className="title">Sign In</h1>

        {err ? <div className="alert error">{err}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="actions">
            <button className="btn solid" type="submit">Login</button>
            <button className="btn ghost" type="button" onClick={ensureUserOnce}>
              Ensure user (once)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}