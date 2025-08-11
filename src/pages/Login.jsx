import { useState } from 'react';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const data = await api.post('/api/login', { email, password });
      if (!data?.token) throw new Error('No token returned');
      setToken(data.token);
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>
          <div>Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required
                 style={{ width:'100%', padding:8 }} />
        </label>
        <label>
          <div>Password</div>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required
                 style={{ width:'100%', padding:8 }} />
        </label>
        <button type="submit" style={{ padding:10 }}>Log in</button>
        {err && <div style={{ color:'crimson' }}>{err}</div>}
      </form>
    </div>
  );
}
