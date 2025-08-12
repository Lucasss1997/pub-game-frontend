import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [showPwd,setShowPwd] = useState(false);
  const [err,setErr] = useState('');
  const [busy,setBusy] = useState(false);

  async function onSubmit(e){
    e.preventDefault(); setErr('');
    try{
      setBusy(true);
      const d = await api.post('/api/login',{email,password});
      if(!d?.token) throw new Error('Login failed');
      setToken(d.token);
      nav('/dashboard',{replace:true});
    }catch(ex){ setErr(ex.message || 'Login failed'); }
    finally{ setBusy(false); }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-narrow pg-stack">
        <div className="pg-card">
          <h1 className="pg-title">LOGIN</h1>
          <p className="pg-sub">Sign in to manage your pub games.</p>

          {err && <div className="pg-bad">{err}</div>}

          <form onSubmit={onSubmit} className="pg-stack">
            <label className="pg-field">
              <span className="pg-label">Email address</span>
              <input className="pg-input" type="email" value={email}
                onChange={e=>setEmail(e.target.value)} placeholder="you@pub.com" required/>
            </label>

            <label className="pg-field" style={{position:'relative'}}>
              <span className="pg-label">Password</span>
              <input className="pg-input" type={showPwd?'text':'password'} value={password}
                onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
              <button type="button" onClick={()=>setShowPwd(v=>!v)}
                style={{position:'absolute', right:10, bottom:10}} className="pg-btn ghost">
                {showPwd?'Hide':'Show'}
              </button>
            </label>

            <button className="pg-btn" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}