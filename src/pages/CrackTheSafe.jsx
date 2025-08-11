import { useState } from 'react';
import TopNav from '../components/TopNav';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE;

export default function CrackTheSafe() {
  const nav = useNavigate();
  const [guess, setGuess] = useState('');
  const [triesLeft, setTriesLeft] = useState(3);
  const [status, setStatus] = useState('');
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const onGuess = async () => {
    if (!/^\d{3}$/.test(guess)) { setStatus('Enter a 3-digit code'); return; }
    if (triesLeft <= 0 || won || loading) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/games/crack-the-safe/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Guess failed');

      if (data.result === 'correct') {
        setStatus('🎉 Correct! You cracked the safe.');
        setWon(true);
      } else if (data.result === 'higher') {
        setStatus('❌ Wrong. Try Higher.');
        setTriesLeft(t => t - 1);
      } else if (data.result === 'lower') {
        setStatus('❌ Wrong. Try Lower.');
        setTriesLeft(t => t - 1);
      } else {
        setStatus('Try again.');
        setTriesLeft(t => t - 1);
      }
    } catch (e) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.app}>
      <TopNav />
      <main style={s.main}>
        <div style={s.headRow}>
          <h1 style={{margin:0}}>Crack the Safe</h1>
          <div style={{display:'flex', gap:8}}>
            <button style={s.btnGhost} onClick={() => setShowRules(true)}>How it works</button>
            <button style={s.btnGhost} onClick={() => nav('/dashboard')}>Back to dashboard</button>
          </div>
        </div>

        <p>Guess the 3-digit code. You have 3 tries.</p>

        <div style={s.row}>
          <input
            value={guess}
            onChange={e => setGuess(e.target.value.replace(/\D/g, '').slice(0,3))}
            placeholder="123"
            style={s.input}
          />
          <button onClick={onGuess} style={s.btn} disabled={triesLeft<=0 || won || loading}>
            {loading ? 'Checking…' : 'Guess'}
          </button>
          <button onClick={() => window.location.reload()} style={s.btnGhost}>Reset</button>
        </div>

        <div style={{marginTop:8, color:'#94a3b8'}}>Tries left: {triesLeft}</div>
        {status && <div style={{marginTop:10}}>{status}</div>}
      </main>

      {showRules && (
        <Modal onClose={() => setShowRules(false)} title="How it works — Crack the Safe">
          <ol style={s.list}>
            <li>The safe code is randomly generated and kept on the server.</li>
            <li>You have <strong>3 guesses</strong>. We’ll say “Higher” or “Lower”.</li>
            <li>If you win, the server rotates to a new code for the next round.</li>
          </ol>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={s.modalWrap} role="dialog" aria-modal="true" aria-label={title}>
      <div style={s.modal}>
        <div style={s.modalHead}>
          <h3 style={{margin:0}}>{title}</h3>
          <button onClick={onClose} style={s.close}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

const s = {
  app: { minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)', color:'#e5e7eb', display:'grid', gridTemplateRows:'auto 1fr' },
  main: { padding:20, maxWidth:600, margin:'0 auto' },
  headRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  row: { display:'flex', gap:8, alignItems:'center', marginTop:10, flexWrap:'wrap' },
  input: { padding:'8px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', width:90, textAlign:'center', letterSpacing:2 },
  btn: { padding:'8px 12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#0b1220', fontWeight:700, cursor:'pointer' },
  btnGhost: { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#e5e7eb', cursor:'pointer' },
  list: { margin:0, paddingLeft:18, display:'grid', gap:6 },
  modalWrap: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'grid', placeItems:'center', padding:20 },
  modal: { width:'min(560px, 100%)', background:'#0f172a', color:'#e5e7eb', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:16 },
  modalHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  close: { background:'transparent', border:'1px solid rgba(255,255,255,0.18)', color:'#e5e7eb', borderRadius:8, padding:'4px 8px', cursor:'pointer' },
};