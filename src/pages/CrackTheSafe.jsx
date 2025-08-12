import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export default function CrackTheSafe() {
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    // auto-play intro if file exists and autoplay allowed
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(()=>{});
    }
  }, []);

  async function submitGuess(e) {
    e.preventDefault();
    setStatus('Checking…'); setError('');
    try {
      const res = await api.post('/api/games/crack-the-safe/guess', { guess });
      if (res.result === 'correct') setStatus('🎉 Correct! You cracked the safe!');
      else if (res.result === 'incorrect') setStatus('Nope! Try again.');
      else setStatus(JSON.stringify(res));
    } catch (e2) { setError(e2.message || 'Error'); }
  }

  return (
    <div style={s.app}>
      <main style={s.main}>
        <audio ref={audioRef} src="/audio/crack-safe-intro-enGB-announcer-v1.mp3" preload="none" />
        <h1 style={{marginTop:0}}>Crack the Safe</h1>
        <p>Enter a 3‑digit code.</p>

        <form onSubmit={submitGuess} style={s.card}>
          <input
            style={s.input}
            value={guess}
            onChange={e=>setGuess(e.target.value)}
            placeholder="000–999"
            inputMode="numeric"
            maxLength={3}
          />
          <button style={s.btn} type="submit">Guess</button>
          {status && <div style={s.info}>{status}</div>}
          {error && <div style={s.bad}>{error}</div>}
        </form>
      </main>
    </div>
  );
}

const s = {
  app:{ minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' },
  main:{ maxWidth:520, margin:'0 auto', padding:20 },
  card:{ display:'grid', gap:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 },
  input:{ padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' },
  btn:{ padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' },
  info:{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.35)', color:'#bbf7d0', padding:8, borderRadius:10 },
  bad:{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 }
};