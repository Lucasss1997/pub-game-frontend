import React, { useState } from 'react';
import { api } from '../lib/api';

export default function WhatsInTheBox(){
  const [pick,setPick]=useState(null);
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(){
    setMsg(''); setErr('');
    try{
      setBusy(true);
      const d = await api.post('/api/games/box/pick',{ box: pick });
      // server returns { result: 'win' | 'lose' }
      setMsg(d?.result==='win' ? '🎉 You picked the prize!' : '😅 Unlucky this time!');
    }catch(ex){ setErr(ex.message||'Error'); }
    finally{ setBusy(false); }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-narrow pg-stack">
        <div className="pg-card">
          <h1 className="pg-title">WHAT’S IN THE BOX</h1>
          <p className="pg-sub">Tap a box to choose</p>

          {err && <div className="pg-bad">{err}</div>}
          {msg && <div className="pg-good">{msg}</div>}

          <div className="pg-row" style={{marginTop:6}}>
            {[1,2,3,4,5,6].map(n=>(
              <button key={n} className="pg-btn" onClick={()=>setPick(n)}
                style={{background: pick===n ? '#7c3aed' : undefined}}>
                Box {n}
              </button>
            ))}
          </div>

          <div className="pg-row" style={{marginTop:10}}>
            <button className="pg-btn" onClick={submit} disabled={busy || !pick}>
              {busy ? 'Checking…' : 'Submit'}
            </button>
            <a className="pg-btn ghost" href="/dashboard">Back</a>
          </div>
        </div>
      </div>
    </div>
  );
}