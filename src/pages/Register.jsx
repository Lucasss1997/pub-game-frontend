import React, { useState } from 'react';
import api from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [pubName, setPubName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await api.post('/api/register', { email, password, pubName });
      setSuccess('Registration successful. Please log in.');
      setError('');
    } catch (err) {
      setError('Registration failed.');
      setSuccess('');
    }
  }

  return (
    <div className="page">
      <h1>Register</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Pub Name"
          value={pubName}
          onChange={(e) => setPubName(e.target.value)}
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}