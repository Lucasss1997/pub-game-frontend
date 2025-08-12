import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function CrackTheSafe() {
  const [price, setPrice] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [guess, setGuess] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const meta = await api.get('/api/public/game-meta?game_key=crack_safe');
        setPrice((meta?.price_cents ?? 0) / 100);
        setJackpot((meta?.jackpot_cents ?? 0) / 100);
      } catch {}
    })();
  }, []);

  // Try several likely endpoints; pick the first that isn't a 404
  async function postGuessSmart(payload) {
    const candidates = [
      '/api/games/crack',                 // simple
      '/api/games/crack_safe/guess',      // snake + /guess
      '/api/games/crack-safe/guess',      // kebab + /guess
      '/api/play/crack',                  // play namespace
      '/api/play/crack_safe/guess',       // play + snake
      '/api/public/crack',                // public
    ];

    for (const path of candidates) {
      try {
        const res = await api.post(path, payload);
        return { path, res };
      } catch (e) {
        // 404: try the next candidate, anything else: bubble up
        if ((e.status || e.code) === 404 || /not found/i.test(e.message || '')) continue;
        throw e;
      }
    }
    // if we reached here, every candidate 404'd
    const error = new Error('No matching crack endpoint found (404).');
    error.status = 404;
    throw error;
  }

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
      const { res } = await postGuessSmart({ guess });

      // Normalise possible backend shapes
      // Accept any of: {result:'correct'|'incorrect'} | {correct:true|false} | {win:true|false}
      const isCorrect =
        res?.result === 'correct' ||
        res?.correct === true ||
        res?.win === true;

      if (isCorrect) setMsg('🎉 Correct! Call the player up!');
      else setMsg('❌ Not quite. Try again!');
    } catch (e2) {
      if (e2.status === 404) {
        setErr('Game endpoint not found on the server.');
      } else {
        setErr(e2.message || 'Could not check code.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg-wrap">
      <header className="pg-header">
        <h1 className="pg-title">Crack the Safe</h1>
        <div className="pg-sub">Ticket: £{price.toFixed(2)} · Jackpot: £{jackpot.toFixed(2)}</div>
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