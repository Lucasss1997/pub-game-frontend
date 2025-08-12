import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css'; // keep your theme

export default function CrackTheSafe() {
  const [price, setPrice] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [guess, setGuess] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    // load ticket price & jackpot for this pub/game
    (async () => {
      try {
        const meta = await api.get('/api/public/game-meta?game_key=crack_safe');
        // meta: { price_cents, jackpot_cents }
        setPrice((meta?.price_cents ?? 0) / 100);
        setJackpot((meta?.jackpot_cents ?? 0) / 100);
      } catch (e) {
        // still show the UI even if meta fails
      }
    })();
  }, []);

  const submitGuess = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!/^\d{3}$/.test(guess)) {
      setErr('Enter a 3‑digit code (000–999).');
      return;
    }
    try {
      setLoading(true);
      // Adjust this endpoint to your backend if needed:
      // expected response: { result: 'correct' | 'incorrect' }
      const res = await api.post('/api/games/crack', { guess });
      if (res?.result === 'correct') setMsg('🎉 Correct! Call the player up!');
      else setMsg('❌ Not quite. Try again!');
    } catch (e2) {
      setErr(e2.message || 'Could not check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg-wrap">
      <header className="pg-header">
        <h1 className="pg-title">Crack the Safe</h1>
        <div className="pg-sub">
          Ticket: £{price.toFixed(2)} · Jackpot: £{jackpot.toFixed(2)}
        </div>
      </header>

      <main className="pg-main">
        <form className="pg-card" onSubmit={submitGuess}>
          <label className="pg-label">Enter 3‑digit code</label>
          <input
            className="pg-input"
            inputMode="numeric"
            pattern="\d{3}"
            maxLength={3}
            placeholder="000"
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
            autoFocus
          />

          <button className="pg-btn" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Submit Guess'}
          </button>

          {msg && <div className="pg-info">{msg}</div>}
          {err && <div className="pg-error">{err}</div>}
        </form>

        <p className="pg-footnote">No hints shown. The code is exactly three digits.</p>
      </main>
    </div>
  );
}