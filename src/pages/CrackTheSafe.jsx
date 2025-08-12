import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function CrackTheSafe() {
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('');     // success/info text
  const [error, setError] = useState('');       // error text
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(null); // in pounds string
  const [jackpot, setJackpot] = useState(null);         // in pounds string

  // Best‑effort fetch of public pricing/jackpot (non‑blocking)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // If your backend exposes something else, this will just fail silently.
        const p = await api.get('/api/public/pricing?game=crack_the_safe');
        if (!ignore && p) {
          if (typeof p.price_cents === 'number') {
            setTicketPrice((p.price_cents / 100).toFixed(2));
          } else if (typeof p.price === 'number') {
            setTicketPrice(p.price.toFixed(2));
          }
          if (typeof p.jackpot_cents === 'number') {
            setJackpot((p.jackpot_cents / 100).toFixed(2));
          } else if (typeof p.jackpot === 'number') {
            setJackpot(p.jackpot.toFixed(2));
          }
        }
      } catch {
        // ignore – page still works without it
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Tries multiple endpoints until one works (handles your server’s kebab_vs_snake case)
  async function postGuess(payload) {
    const endpoints = [
      '/api/games/crack-safe/guess',
      '/api/games/crack_the_safe/guess',
    ];
    let lastErr;
    for (const path of endpoints) {
      try {
        const res = await api.post(path, payload);
        return res;
      } catch (e) {
        lastErr = e;
        // if 404, try the next endpoint
        if (e && (e.status === 404 || /not\s*found/i.test(e.message || ''))) {
          continue;
        }
        // for other errors, rethrow
        throw e;
      }
    }
    // If we’re here, every endpoint failed (likely 404s)
    const err = new Error('Game endpoint not found on the server.');
    err.cause = lastErr;
    throw err;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setStatus('');

    const clean = (guess || '').trim();
    if (!/^\d{3}$/.test(clean)) {
      setError('Please enter exactly three digits (000–999).');
      return;
    }

    try {
      setLoading(true);
      const body = { guess: clean };
      const data = await postGuess(body);

      // Expecting one of: { result: 'correct' } | { result: 'wrong' }
      if (data?.result === 'correct') {
        setStatus('🎉 Correct! You cracked the safe!');
      } else if (data?.result === 'wrong') {
        setStatus('❌ Not this time. Try again!');
      } else if (typeof data === 'string') {
        // some backends return plain text
        setStatus(data);
      } else {
        setStatus('Guess submitted.');
      }
    } catch (e2) {
      setError(e2?.message || 'Error submitting guess.');
    } finally {
      setLoading(false);
    }
  }

  const s = styles;

  return (
    <div style={s.wrap}>
      <div style={s.headerBlock}>
        <h1 style={s.title}>Crack the Safe</h1>
        {(ticketPrice || jackpot) && (
          <p style={s.meta}>
            {ticketPrice ? `Ticket: £${ticketPrice}` : null}
            {ticketPrice && jackpot ? ' · ' : null}
            {jackpot ? `Jackpot: £${jackpot}` : null}
          </p>
        )}
      </div>

      <form onSubmit={submit} style={s.card}>
        <label style={s.label}>Enter 3‑digit code</label>
        <input
          style={s.input}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="000"
          inputMode="numeric"
          maxLength={3}
        />

        <button type="submit" style={s.button} disabled={loading}>
          {loading ? 'Checking…' : 'Submit Guess'}
        </button>

        {status ? <div style={s.info}>{status}</div> : null}
        {error ? <div style={s.err}>{error}</div> : null}
      </form>

      <p style={s.help}>No hints shown. The code is exactly three digits.</p>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    background: '#ef9d10', // orange background
    padding: '28px 16px 64px',
    color: '#2b0a6b',      // deep purple for headings
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  headerBlock: { maxWidth: 820, margin: '0 auto 10px' },
  title: { margin: 0, fontSize: 36, lineHeight: 1.1, letterSpacing: 0.2 },
  meta: { margin: '8px 0 0', opacity: 0.9, color: '#3d167e' },

  card: {
    maxWidth: 820,
    margin: '18px auto 0',
    background: 'linear-gradient(180deg, #f7b548 0%, #f1a433 100%)',
    border: '3px solid #4a20a0',
    borderRadius: 20,
    padding: 18,
    boxShadow: '0 18px 40px rgba(0,0,0,0.15)',
  },
  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: 6,
    color: '#3b1386',
  },
  input: {
    width: '100%',
    fontSize: 22,
    padding: '12px 14px',
    borderRadius: 14,
    border: '3px solid #4a20a0',
    outline: 'none',
    background: '#ffe08a',
    color: '#1e1b4b',
    marginBottom: 12,
  },
  button: {
    display: 'inline-block',
    border: '3px solid #4a20a0',
    background: '#5b21b6',
    color: '#fff',
    borderRadius: 22,
    padding: '10px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  info: {
    marginTop: 12,
    background: 'rgba(34,197,94,0.15)',
    border: '2px solid rgba(34,197,94,0.6)',
    color: '#064e3b',
    borderRadius: 12,
    padding: '10px 12px',
  },
  err: {
    marginTop: 12,
    background: 'rgba(239,68,68,0.18)',
    border: '2px solid rgba(239,68,68,0.6)',
    color: '#7f1d1d',
    borderRadius: 12,
    padding: '10px 12px',
  },
  help: {
    maxWidth: 820,
    margin: '12px auto 0',
    color: 'rgba(43,10,107,0.8)',
  },
};