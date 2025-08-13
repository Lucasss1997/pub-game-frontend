import React, { useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [pubName, setPubName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await api.post('/api/register', { email, password, pubName });
      if (res && res.id) {
        // Registered – send to login
        window.location.href = '/login';
      } else {
        setErr('Registration failed.');
      }
    } catch (e2) {
      setErr(e2?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-card">
        <h1>Sign Up</h1>
        {err && <div className="pg-alert">{err}</div>}
        <form onSubmit={submit} className="pg-form">
          <label>Pub name</label>
          <input
            className="pg-input"
            value={pubName}
            onChange={e=>setPubName(e.target.value)}
            placeholder="The King’s Arms"
            required
          />

          <label>Email</label>
          <input
            className="pg-input"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@pub.com"
            required
          />

          <label>Password</label>
          <input
            className="pg-input"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button className="pg-btn" type="submit" disabled={busy}>
            {busy ? 'Creating...' : 'Create account'}
          </button>

          <div className="pg-muted" style={{marginTop:12}}>
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
}