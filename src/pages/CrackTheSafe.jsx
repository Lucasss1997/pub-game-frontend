import React, { useState } from 'react';
import { api } from '../lib/api';

export default function CrackTheSafe(){
  const [guess,setGuess]=useState('');
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(e){
    e.preventDefault(); setMsg(''); setErr('');
    try{
      setBusy(true);
      const d = await api.post('/api/games/crack/guess',{ guess });
      // server returns { result: 'correct' | 'wrong' }
      if(d?.result==='correct') setMsg('✅ Correct! Winner!');
      else setMsg('❌ Wrong code. Try again!');
      setGuess('');
    }catch(ex){ setErr(ex.message||'Error'); }
    finally{ setBusy(false); }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-narrow pg-stack">
        <div className="pg-card">
          <h1 className="pg-title">CRACK THE SAFE</h1>
          <p className="pg-sub">Enter a 3‑digit code</p>

          {err && <div className="pg-bad">{err}</div>}
          {msg && <div className="pg-good">{msg}</div>}

          <form onSubmit={submit} className="pg-stack">
            <input className="pg-input" inputMode="numeric" pattern="[0-9]*" maxLength={3}
              value={guess} onChange={e=>setGuess(e.target.value.replace(/\D/g,''))} placeholder="000–999" />
            <button className="pg-btn" disabled={busy || guess.length!==3}>
              {busy ? 'Checking…' : 'Submit Guess'}
            </button>
          </form>

          <div className="pg-row" style={{marginTop:10}}>
            <a className="pg-btn ghost" href="/dashboard">Back</a>
          </div>
        </div>
      </div>
    </div>
  );
}