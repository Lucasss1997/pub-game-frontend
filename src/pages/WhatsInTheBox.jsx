import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export default function WhatsInTheBox() {
  const [choice, setChoice] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(()=>{});
    }
  }, []);

  async function submitPick(e){
    e.preventDefault();
    setStatus('Checking…'); setError('');
    try{
      const res = await api.post('/api/games/whats-in-the-box/pick', { box: choice });
      if (res.result === 'win') setStatus('🎉 You picked the prize!');
      else if (res.result === 'lose') setStatus('Not this time. Try again!');
      else setStatus(JSON.stringify(res));
    }catch(e2){ setError(e2.message || 'Error'); }
  }

  return (
    <div style={s.app}>
      <main style={s.main}>
        <audio ref={audioRef} src="/audio/whats-in-the-box-intro-enGB-announcer-v1.mp3" preload="none" />
        <h1 style={{marginTop:0}}>What’s in the Box</h1>
        <form onSubmit={submitPick} style={s.card}>
          <div style={{display:'grid', gap:10, gridTemplateColumns:'repeat(5,1fr)'}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button"
                onClick={()=>setChoice(n)}
                style={{
                  ...s.boxBtn,
                  background: choice===n ? '#22c55e' : 'rgba(255,255,255,0.06)',
                  color: choice===n ? '#0b1220' : '#e5e7eb'
                }}>
                {n}
              </button>
            ))}
          </div>
          <button style={s.btn} type="submit">Open</button>
          {status && <div style={s.info}>{status}</div>}
          {error && <div style={s.bad}>{error}</div>}
        </form>
      </main>
    </div>
  );
}

const s = {
  app:{ minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' },
  main:{ maxWidth:640, margin:'0 auto', padding:20 },
  card:{ display:'grid', gap:14, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 },
  boxBtn:{ padding:'16px 0', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, cursor:'pointer' },
  btn:{ padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' },
  info:{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.35)', color:'#bbf7d0', padding:8, borderRadius:10 },
  bad:{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 }
};