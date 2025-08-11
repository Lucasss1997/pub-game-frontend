import React, { useState } from 'react';
import { api } from '../../lib/api';

// Public page: anyone can pick a box (no login required)
export default function WhatsInTheBoxPublic() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function openBox(n) {
    setError('');
    setStatus('Checking…');
    try {
      const res = await api.post('/api/games/whats-in-the-box/open', { boxId: n });
      if (res.result === 'win') setStatus(`🎉 Box #${n} wins!`);
      else if (res.result === 'miss') setStatus(`Nope, not #${n}. Try again!`);
      else setStatus(JSON.stringify(res));
    } catch (e2) {
      setError(e2.message || 'Error');
      setStatus('');
    }
  }

  const s = styles;
  return (
    <div style={s.wrap}>
      <main style={s.main}>
        <h1 style={{marginTop:0}}>What’s in the Box</h1>
        <p>Pick a box 1–20.</p>
        <div style={s.grid}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <button key={n} style={s.box} onClick={() => openBox(n)}>{n}</button>
          ))}
        </div>
        {status && <div style={s.info}>{status}</div>}
        {error && <div style={s.err}>{error}</div>}
        <p style={s.small}>Powered by Pub Game</p>
      </main>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center' },
  main: { padding: 20, maxWidth: 520, width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 },
  box: { padding: '18px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 18, cursor: 'pointer' },
  info: { marginTop: 12, color: '#bfdbfe' },
  err: { marginTop: 12, color: '#fecaca' },
  small: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 12 },
};