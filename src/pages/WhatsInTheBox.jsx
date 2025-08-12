import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function WhatsInTheBox() {
  const [price, setPrice] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [boxes, setBoxes] = useState([]);
  const [picking, setPicking] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const meta = await api.get('/api/public/game-meta?game_key=whats_in_the_box');
        setPrice((meta?.price_cents ?? 0) / 100);
        setJackpot((meta?.jackpot_cents ?? 0) / 100);
      } catch {}
      // Load current round state (number of boxes, which are available, etc.)
      try {
        const state = await api.get('/api/games/whats_in_the_box/state');
        // expect: { boxes: [{id, label, opened, winner}] }
        setBoxes(state?.boxes || []);
      } catch (e) {
        // fallback to 6 closed boxes if API not ready
        setBoxes(Array.from({ length: 6 }, (_, i) => ({ id: i + 1, label: `${i + 1}`, opened: false })));
      }
    })();
  }, []);

  const pick = async (id) => {
    setErr('');
    setMsg('');
    setPicking(true);
    try {
      // expected response: { result: 'win' | 'lose', boxes: [...] }
      const res = await api.post('/api/games/whats_in_the_box/pick', { box_id: id });
      if (res?.result === 'win') setMsg('🎉 Winner! Collect your prize!');
      else setMsg('❌ Not this time.');
      if (res?.boxes) setBoxes(res.boxes);
    } catch (e2) {
      setErr(e2.message || 'Could not pick a box.');
    } finally {
      setPicking(false);
    }
  };

  return (
    <div className="pg-wrap">
      <header className="pg-header">
        <h1 className="pg-title">What’s in the Box</h1>
        <div className="pg-sub">
          Ticket: £{price.toFixed(2)} · Jackpot: £{jackpot.toFixed(2)}
        </div>
      </header>

      <main className="pg-main">
        <div className="pg-grid">
          {boxes.map((b) => (
            <button
              key={b.id}
              className={`pg-box ${b.opened ? 'open' : ''}`}
              onClick={() => pick(b.id)}
              disabled={picking || b.opened}
              aria-label={`Pick box ${b.label}`}
            >
              <span>{b.opened ? '🎁' : b.label}</span>
            </button>
          ))}
        </div>

        {msg && <div className="pg-info" style={{ marginTop: 12 }}>{msg}</div>}
        {err && <div className="pg-error" style={{ marginTop: 12 }}>{err}</div>}
      </main>
    </div>
  );
}