// src/pages/Login.jsx
import React, { useState } from 'react';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('new@pub.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const r = await api.post('/api/login', { email, password });
      if (r?.token) api.setToken(r.token);
      window.location.assign('/dashboard');
    } catch (e2) {
      setErr(e2?.response?.error || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function ensureUser() {
    // one-tap helper to create the account if it doesn't exist
    setErr('');
    setBusy(true);
    try {
      await api.post('/api/dev/ensure-user', { email, password: password || 'password123', pub_id: 1 });
      setErr('User ensured. Try logging in again.');
    } catch (e2) {
      setErr(e2?.response?.error || 'Could not ensure user');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Sign In</h1>
      {err && <div className="alert error">{err}</div>}
      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
        <button className="btn" disabled={busy} type="submit">
          {busy ? 'Logging in…' : 'Login'}
        </button>
        <button type="button" className="btn ghost" onClick={ensureUser} disabled={busy} style={{ marginTop: 8 }}>
          Ensure user (once)
        </button>
      </form>
    </div>
  );
}