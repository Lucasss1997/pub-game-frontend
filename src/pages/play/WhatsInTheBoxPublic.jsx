import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import IntroVideoModal from '../../components/IntroVideoModal';
import { confetti, ping, vibe } from '../../lib/fx';

const INTRO_BOX_URL =
  process.env.REACT_APP_INTRO_BOX_URL ||
  'https://files.catbox.moe/3r1y8o.mp4'; // replace with your hosted MP4

export default function WhatsInTheBoxPublic() {
  const [introOpen, setIntroOpen] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const key = 'pg_intro_box_seen';
    const last = localStorage.getItem(key);
    const nowDay = new Date().toDateString();
    if (last === nowDay) setIntroOpen(false);
  }, []);
  const closeIntro = () => {
    localStorage.setItem('pg_intro_box_seen', new Date().toDateString());
    setIntroOpen(false);
  };

  async function openBox(n) {
    setError(''); setStatus('Checking…');
    try {
      const res = await api.post('/api/games/whats-in-the-box/open', { boxId: n });
      if (res.result === 'win') {
        setStatus(`🎉 Box #${n} wins!`);
        ping(); confetti(); vibe(40);
      } else if (res.result === 'miss') {
        setStatus(`Nope, not #${n}. Try again!`);
        vibe(10);
      } else {
        setStatus(JSON.stringify(res));
      }
    } catch (e2) { setError(e2.message || 'Error'); setStatus(''); }
  }

  return (
    <div style={wrap}>
      <IntroVideoModal
        open={introOpen}
        onClose={closeIntro}
        src={INTRO_BOX_URL}
        title="What’s in the Box"
        cta="Start"
        autoCloseAt={0}
      />
      <main style={{ padding:20, maxWidth:520, width:'100%' }}>
        <h1 style={{ marginTop:0 }}>What’s in the Box</h1>
        <p>Pick a box 1–20.</p>
        <div style={grid}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <button key={n} style={box} onClick={() => openBox(n)}>{n}</button>
          ))}
        </div>
        {status && <div style={{ marginTop:12, color:'#bfdbfe' }}>{status}</div>}
        {error && <div style={{ marginTop:12, color:'#fecaca' }}>{error}</div>}
        <p style={fine}>Powered by Pub Game</p>
      </main>
    </div>
  );
}

const wrap = { minHeight:'100vh', background:'#0f172a', color:'#fff', display:'grid', placeItems:'center',
  fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif' };
const grid = { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 };
const box = { padding:'18px 0', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)',
  background:'rgba(255,255,255,0.07)', color:'#fff', fontSize:18, cursor:'pointer' };
const fine = { color:'#94a3b8', fontSize:12, textAlign:'center', marginTop:12 };