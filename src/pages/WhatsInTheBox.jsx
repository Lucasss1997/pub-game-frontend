import { useMemo, useState } from 'react';
import TopNav from '../components/TopNav';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE;

export default function WhatsInTheBox() {
  const nav = useNavigate();
  const [opened, setOpened] = useState(0);
  const [message, setMessage] = useState('Pick a box!');
  const [won, setWon] = useState(false);

  // Just the visual boxes; server decides if it's a win.
  const boxes = useMemo(() =>
    Array.from({length: 20}, (_, i) => ({ id: i+1, opened: false }))
  , []);

  const openBox = async (idx) => {
    const b = boxes[idx];
    if (b.opened || won) return;

    try {
      const res = await fetch(`${API}/api/games/whats-in-the-box/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId: b.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Open failed');

      b.opened = true;
      setOpened(n => n+1);

      if (data.result === 'win') {
        setMessage('🎉 Winner! You found the prize.');
        setWon(true);
      } else {
        setMessage('No prize. Keep trying!');
      }
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <div style={s.app}>
      <TopNav />
      <main style={s.main}>
        <div style={s.headRow}>
          <h1 style={{margin:0}}>What’s in the Box</h1>
          <div style={{display:'flex', gap:8}}>
            <button style={s.btnGhost} onClick={() => alert('Rules: One prize among 20 boxes. Click to reveal. Wins rotate the prize to a new box.')}>How it works</button>
            <button style={s.btnGhost} onClick={() => nav('/dashboard')}>Back to dashboard</button>
          </div>
        </div>

        <p>There’s a prize in one of the boxes. Pick wisely.</p>

        <div style={s.grid}>
          {boxes.map((b, i) => (
            <button
              key={b.id}
              onClick={() => openBox(i)}
              disabled={b.opened || won}
              style={{ ...s.box, ...(b.opened ? s.boxOpened : {}) }}
              aria-label={`Box ${b.id}`}
            >
              {b.opened ? '❌' : b.id}
            </button>
          ))}
        </div>

        <div style={{marginTop:10}}>{message}</div>
        <div style={{marginTop:6, color:'#94a3b8'}}>Opened: {opened} / 20</div>
        <button onClick={() => window.location.reload()} style={{...s.btn, marginTop:10}}>Reset</button>
      </main>
    </div>
  );
}

const s = {
  app: { minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb', display:'grid', gridTemplateRows:'auto 1fr' },
  main: { padding:20, maxWidth:900, margin:'0 auto' },
  headRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:10, marginTop:12 },
  box: { height:70, borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:18, cursor:'pointer' },
  boxOpened: { opacity:0.8, cursor:'default' },
  btn: { padding:'8px 12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#0b1220', fontWeight:700, cursor:'pointer' },
  btnGhost: { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#e5e7eb', cursor:'pointer' },
};