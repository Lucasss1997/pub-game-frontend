import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import IntroVideoModal from '../../components/IntroVideoModal';
import { confetti, ping, vibe } from '../../lib/fx';

const INTRO_SAFE_URL =
  process.env.REACT_APP_INTRO_SAFE_URL ||
  'https://files.catbox.moe/5r2z6v.mp4'; // replace with your hosted MP4

export default function CrackSafePublic() {
  const [introOpen, setIntroOpen] = useState(true);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // politely show intro only once per day per device
    const key = 'pg_intro_safe_seen';
    const last = localStorage.getItem(key);
    const nowDay = new Date().toDateString();
    if (last === nowDay) setIntroOpen(false);
  }, []);
  const closeIntro = () => {
    localStorage.setItem('pg_intro_safe_seen', new Date().toDateString());
    setIntroOpen(false);
  };

  async function submitGuess(e) {
    e.preventDefault();
    setError(''); setStatus('Checking…');
    try {
      const res = await api.post('/api/games/crack-the-safe/guess', { guess });
      if (res.result === 'correct') {
        setStatus('🎉 Correct! The safe is cracked! A new code has been set.');
        ping(); confetti(); vibe(40);
      } else if (res.result === 'higher') {
        setStatus('🔺 Higher'); vibe(10);
      } else if (res.result === 'lower') {
        setStatus('🔻 Lower'); vibe(10);
      } else {
        setStatus(JSON.stringify(res));
      }
    } catch (e2) {
      setError(e2.message || 'Error');
      setStatus('');
    }
  }

  return (
    <div style={wrap}>
      <IntroVideoModal
        open={introOpen}
        onClose={closeIntro}
        src={INTRO_SAFE_URL}
        title="Crack the Safe"
        cta="Start"
        autoCloseAt={0}
      />
      <main style={{ padding:20, maxWidth:480, width:'100%' }}>
        <h1 style={{ marginTop:0 }}>Crack the Safe</h1>
        <p>Enter a 3‑digit code.</p>
        <form onSubmit={submitGuess} style={card}>
          <input
            style={input}
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="000–999" inputMode="numeric" pattern="\d{3}" required
          />
          <button style={playBtn} type="submit">Guess</button>
          {status && <div style={{ marginTop:6, color:'#bfdbfe' }}>{status}</div>}
          {error && <div style={{ marginTop:6, color:'#fecaca' }}>{error}</div>}
        </form>
        <p style={fine}>Powered by Pub Game</p>
      </main>
    </div>
  );
}

const wrap = { minHeight:'100vh', background:'#0f172a', color:'#fff', display:'grid', placeItems:'center',
  fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif' };
const card = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
  borderRadius:12, padding:16, display:'grid', gap:10 };
const input = { padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.18)',
  background:'rgba(15,23,42,0.8)', color:'#fff', width:140 };
const playBtn = { padding:'10px 14px', borderRadius:10, border:0, background:'#22c55e', color:'#0f172a',
  fontWeight:800, width:140, cursor:'pointer' };
const fine = { color:'#94a3b8', fontSize:12, textAlign:'center', marginTop:12 };