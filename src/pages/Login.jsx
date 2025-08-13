import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('new@pub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: { email, password },
      });
      // store Bearer token as fallback, cookie is set by server
      if (data?.token) setToken(data.token);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 520 }}>
        <h1>Sign In</h1>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn solid" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}