import React, { useState } from 'react';
import { api } from '../lib/api';

export default function WhatsInTheBox() {
  const [choice, setChoice] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitPick(e){
    e.preventDefault();
    setStatus('Checking…'); setError('');
    try{
      const res = await api.post('/api/games/whats-in-the-box/pick', { box: choice });
      if (res.result === 'win') setStatus('🎉 You picked the prize!');
      else if (res.result === 'lose') setStatus('Not this time. Try again!');
      else setStatus(JSON.stringify(res));
    }catch(e2){
      setError(e2.message || 'Error');
    }
  }

  return (
    <div style={shell}>
      <main style={main}>
        <h1 style={{marginTop:0}}>What’s in the Box</h1>
        <form onSubmit={submitPick} style={card}>
          <label style={{display:'grid', gap:6}}>
            <span style={{fontSize:12, color:'#94a3b8'}}>Choose a box (1–5)</span>
            <select style={input} value={choice} onChange={e=>setChoice(Number(e.target.value))}>
              {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button style={button} type="submit">Open</button>
          {status && <div style={info}>{status}</div>}
          {error && <div style={bad}>{error}</div>}
        </form>
      </main>
    </div>
  );
}

const shell = { minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' };
const main  = { maxWidth:520, margin:'0 auto', padding:20 };
const card  = { display:'grid', gap:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 };
const input = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' };
const button= { padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' };
const info  = { background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.35)', color:'#bbf7d0', padding:8, borderRadius:10 };
const bad   = { background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 };