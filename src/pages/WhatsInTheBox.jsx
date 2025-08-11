import { useState } from 'react';
import TopNav from '../components/TopNav';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

const API = process.env.REACT_APP_API_BASE;

export default function WhatsInTheBox() {
  const nav = useNavigate();
  const [opened, setOpened] = useState(() => Array(20).fill(false));
  const [message, setMessage] = useState('Pick a box!');
  const [won, setWon] = useState(false);
  const [busy, setBusy] = useState(false);

  const openBox = async (index) => {
    if (opened[index] || busy || won) return;
    try {
      setBusy(true);
      const res = await fetch(`${API}/api/games/whats-in-the-box/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId: index + 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Open failed');

      const next = [...opened];
      next[index] = true;
      setOpened(next);

      if (data.result === 'win') {
        setMessage('🎉 Winner! You found the prize.');
        setWon(true);
      } else {
        setMessage('No prize. Keep trying!');
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://YOUR-FRONTEND-DOMAIN/whats-in-the-box';

  return (
    <div style={s.app}>
      <TopNav />
      <main style={s.main}>
        <div style={s.headRow}>
          <h1 style={{margin:0}}>What’s in the Box</h1>
          <div style={{display:'flex', gap:8}}>
            <button style={s.btnGhost} onClick={() => alert('Rules: 1 prize hidden among 20 boxes. Win rotates to a new box for the next round.')}>How it works</button>
            <button style={s.btnGhost} onClick={() => nav('/dashboard')}>Back to dashboard</button>
          </div>
        </div>

        <div style={s.qrRow}>
          <div>
            <p style={{margin:'6px 0'}}>Players: scan to play on your phone</p>
            <QRCode value={pageUrl} size={96} />
          </div>
          <div style={{flex:1}} />
        </div>

        <p>There’s a prize in one of the boxes. Pick wisely.</p>

        <div style={s.grid}>
          {opened.map((isOpen, i) => (
            <button
              key={i}
              onClick={() => openBox(i)}
              disabled={isOpen || busy || won}
              style={{ ...s.box, ...(isOpen ? s.boxOpened : {}) }}
              aria-label={`Box ${i+1}`}
            >
              {isOpen ? '❌' : i + 1}
            </button>
          ))}
        </div>

        <div style={{marginTop:10}}>{message}</div>
        <button onClick={() => window.location.reload()} style={{...s.btn, marginTop:10}}>Reset</button>
      </main>
    </div>
  );
}

const s = {
  app: { minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb', display:'grid', gridTemplateRows:'auto 1fr' },
  main: { padding:20, maxWidth:900, margin:'0 auto' },
  headRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  qrRow: { display:'flex', alignItems:'center', gap:16, margin: '8px 0 16px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:10, marginTop:12 },
  box: { height:70, borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:18, cursor:'pointer' },
  boxOpened: { opacity:0.8, cursor:'default' },
  btn: { padding:'8px 12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#0b1220', fontWeight:700, cursor:'pointer' },
  btnGhost: { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#e5e7eb', cursor:'pointer' },
};