import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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
      nav('/dashboard', { replace: true });
    }catch(e2){
      setErr(e2.message || 'Login failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div style={s.app}>
      <main style={s.main}>
        <form onSubmit={onSubmit} style={s.card}>
          <h1 style={{margin:0}}>Pub Game Login</h1>
          <p style={{margin:0, color:'#94a3b8'}}>Sign in to manage your pub games.</p>

          {err && <div style={s.bad}>{err}</div>}

          <label style={s.field}>
            <span style={s.label}>Email</span>
            <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>

          <label style={s.field}>
            <span style={s.label}>Password</span>
            <div style={{position:'relative'}}>
              <input style={{...s.input, paddingRight:44}} type={showPwd?'text':'password'}
                     value={password} onChange={e=>setPwd(e.target.value)} required />
              <button type="button" onClick={()=>setShowPwd(v=>!v)} style={s.reveal}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button style={s.btn} disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
        </form>
      </main>
    </div>
  );
}

const s = {
  app:{ minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' },
  main:{ maxWidth:460, margin:'0 auto', padding:20 },
  card:{ display:'grid', gap:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 },
  field:{ display:'grid', gap:6 },
  label:{ fontSize:12, color:'#94a3b8' },
  input:{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' },
  reveal:{ position:'absolute', right:6, top:6, width:32, height:32, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.06)', color:'#e5e7eb' },
  btn:{ padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' },
  bad:{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 }
};