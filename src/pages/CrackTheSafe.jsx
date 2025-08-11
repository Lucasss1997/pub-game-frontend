import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';

export default function CrackTheSafe() {
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitGuess(e) {
    e.preventDefault();
    setError('');
    setStatus('Checking...');
    try {
      const res = await api.post('/api/games/crack-the-safe/guess', { guess });
      if (res.result === 'correct') {
        setStatus('🎉 Correct! The safe is cracked. A new code has been set.');
      } else if (res.result === 'higher') {
        setStatus('🔺 Higher');
      } else if (res.result === 'lower') {
        setStatus('🔻 Lower');
      } else {
        setStatus(JSON.stringify(res));
      }
    } catch (e2) {
      setError(e2.message || 'Error');
      setStatus('');
    }
  }

  const s = styles;
  return (
    <div style={s.wrap}>
      <TopNav />
      <main style={s.main}>
        <h1>Crack the Safe</h1>
        <form onSubmit={submitGuess} style={s.card}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Enter a 3-digit code</span>
            <input
              style={s.input}
              value={guess}
              onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="000–999"
              inputMode="numeric"
              pattern="\d{3}"
              required
            />
          </label>
          <button style={s.btn} type="submit">Guess</button>
          {status && <div style={s.info}>{status}</div>}
          {error && <div style={s.err}>{error}</div>}
        </form>
      </main>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'grid', gridTemplateRows: 'auto 1fr' },
  main: { padding: 20, maxWidth: 800, margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'grid', gap: 10 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.7)', color: '#fff', width: 120 },
  btn: { marginTop: 8, padding: '10px 14px', borderRadius: 10, border: 0, background: '#22c55e', color: '#0f172a', fontWeight: 800, width: 120 },
  info: { marginTop: 8, color: '#bfdbfe' },
  err: { marginTop: 8, color: '#fecaca' },
};