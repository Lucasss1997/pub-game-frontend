import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';
import '../ui/pubgame-theme.css';

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [showPwd,setShowPwd] = useState(false);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState('');

  async function onSubmit(e){
    e.preventDefault(); setErr('');
    if(!email || !password){ setErr('Please enter email and password.'); return; }
    try{
      setLoading(true);
      const data = await api.post('/api/login', { email, password });
      if(!data?.token) throw new Error('No token returned');
      setToken(data.token);
      nav('/dashboard', { replace:true });
    }catch(ex){ setErr(ex.message || 'Login failed'); }
    finally{ setLoading(false); }
  }

  return (
    <div className="pg-wrap">
      {/* top bar */}
      <div className="pg-nav">
        <div className="pg-brand">🍺 Pub Game</div>
        <a className="pg-chip" href="/">Home</a>
      </div>

      {/* grid with just one orange card on login */}
      <div className="pg-grid" style={{maxWidth:640}}>
        <section className="pg-card orange">
          <h2>Pub Game Login</h2>
          <small>Sign in to manage your pub games.</small>

          {err && <div className="pg-bad">{err}</div>}

          <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
            <label className="pg-field">
              <span className="pg-label">Email</span>
              <input
                className="pg-input" type="email" value={email}
                onChange={e=>setEmail(e.target.value)} placeholder="you@pub.com" autoComplete="email" required
              />
            </label>

            <label className="pg-field" style={{position:'relative'}}>
              <span className="pg-label">Password</span>
              <input
                className="pg-input" type={showPwd?'text':'password'} value={password}
                onChange={e=>setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required
              />
              <button
                type="button"
                onClick={()=>setShowPwd(v=>!v)}
                style={{
                  position:'absolute', right:10, bottom:12, width:34, height:34,
                  border:'1px solid rgba(255,255,255,.25)', background:'rgba(255,255,255,.18)',
                  color:'#fff', borderRadius:10, cursor:'pointer'
                }}
                aria-label={showPwd?'Hide password':'Show password'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </label>

            <button className="pg-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}