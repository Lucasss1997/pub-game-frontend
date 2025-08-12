import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e){
    e.preventDefault();
    setErr('');
    try{
      setLoading(true);
      const data = await api.post('/api/login', { email, password });
      if(!data?.token) throw new Error('No token returned');
      setToken(data.token);
      nav('/dashboard', { replace:true });
    }catch(e2){
      setErr(e2.message || 'Login failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div style={shell}>
      <main style={main}>
        <form onSubmit={onSubmit} style={card}>
          <h1 style={{margin:0}}>Pub Game Login</h1>
          {err && <div style={bad}>{err}</div>}
          <label style={field}>
            <span style={label}>Email</span>
            <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>
          <label style={field}>
            <span style={label}>Password</span>
            <input style={input} type="password" value={password} onChange={e=>setPwd(e.target.value)} required />
          </label>
          <button style={button} disabled={loading}>{loading ? 'Signing in…':'Login'}</button>
        </form>
      </main>
    </div>
  );
}

const shell = { minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' };
const main  = { maxWidth:420, margin:'0 auto', padding:20 };
const card  = { display:'grid', gap:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 };
const field = { display:'grid', gap:6 };
const label = { fontSize:12, color:'#94a3b8' };
const input = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' };
const button= { padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' };
const bad   = { background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 };