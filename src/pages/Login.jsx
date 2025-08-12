import React, { useState } from 'react';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';
import '../ui/pubgame-theme.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      const res = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        setToken(res.token);
        window.location.href = '/dashboard';
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed.');
    }
  };

  return (
    <div className="neon-wrap center">
      <div className="card">
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" onClick={submit}>Login</button>
      </div>
    </div>
  );
}