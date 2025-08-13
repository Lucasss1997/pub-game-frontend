// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post } from '../lib/api';
import '../ui/pubgame-theme.css';

const GAMES = [
  { key: 'crack', label: 'Crack the Safe' },
  { key: 'box',   label: "What's in the Box" },
];

function moneyToInput(cents) { return (cents ?? 0) / 100 };
function inputToCents(v) {
  if (v == null || v === '') return 0;
  const n = parseFloat(String(v).replace(/[£,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [rows, setRows] = useState([]);     // products
  const [jackpots, setJackpots] = useState({}); // { crack: cents, box: cents }
  const [savingKey, setSavingKey] = useState('');

  const byGame = useMemo(() => {
    const m = { crack: [], box: [] };
    for (const r of rows) (m[r.game_key] || (m[r.game_key] = [])).push(r);
    return m;
  }, [rows]);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const d = await get('/api/admin/products');
      setRows(d.products || []);
      setJackpots(d.jackpots || {}); // server should return { crack: 0, box: 0 }
    } catch (e) {
      setErr(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function updateRow(id, patch) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  async function saveProducts(gameKey) {
    setErr('');
    setSavingKey(gameKey);
    try {
      const payload = rows
        .filter(r => r.game_key === gameKey)
        .map(r => ({
          id: r.id,
          game_key: r.game_key,
          name: r.name,
          price: moneyToInput(r.price_cents), // server parses to cents
          active: !!r.active,
        }));
      await post('/api/admin/products', { products: payload });
      await load();
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSavingKey('');
    }
  }

  async function saveJackpot(gameKey) {
    setErr('');
    setSavingKey(gameKey);
    try {
      const pounds = moneyToInput(jackpots[gameKey] || 0);
      await post('/api/admin/jackpot', { game_key: gameKey, jackpot: pounds });
      await load();
    } catch (e) {
      setErr(e.message || 'Jackpot save failed');
    } finally {
      setSavingKey('');
    }
  }

  return (
    <div className="page-wrap">
      <div className="toolbar">
        <Link className="btn ghost" to="/dashboard">Back to Dashboard</Link>
        <Link className="btn ghost" to="/enter/DEMO_PUB/crack">New Game</Link>
        <Link className="btn ghost" to="/billing">Billing</Link>
        <Link className="btn solid" to="/login">Logout</Link>
      </div>

      <h1 className="title">Admin</h1>

      {err ? <div className="alert error">{err}</div> : null}
      {loading ? <p>Loading…</p> : null}

      {!loading && GAMES.map(({ key, label }) => (
        <section className="card" key={key}>
          <h2 className="section-title">{label}</h2>

          {(byGame[key] && byGame[key].length) ? (
            byGame[key].map((r) => (
              <div key={r.id} style={{ borderTop: '1px dashed #6a38d9', paddingTop: 10, marginTop: 10 }}>
                <div className="field">
                  <span>Product name</span>
                  <input value={r.name || ''} onChange={e => updateRow(r.id, { name: e.target.value })} />
                </div>

                <div className="field">
                  <span>Ticket price (£)</span>
                  <input
                    inputMode="decimal"
                    value={moneyToInput(r.price_cents)}
                    onChange={e => updateRow(r.id, { price_cents: inputToCents(e.target.value) })}
                  />
                </div>

                <div className="field">
                  <span>Active</span>
                  <select value={r.active ? 'yes' : 'no'}
                          onChange={e => updateRow(r.id, { active: e.target.value === 'yes' })}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <button
                  className="btn solid"
                  disabled={savingKey === key}
                  onClick={() => saveProducts(key)}
                >
                  Save
                </button>
              </div>
            ))
          ) : (
            <p>No products configured yet for this game.</p>
          )}

          {/* Jackpot under the products for this game */}
          <div style={{ borderTop: '1px dashed #6a38d9', marginTop: 16, paddingTop: 12 }} />
          <div className="field">
            <span>Jackpot (£)</span>
            <input
              inputMode="decimal"
              value={moneyToInput(jackpots[key] || 0)}
              onChange={e => setJackpots(j => ({ ...j, [key]: inputToCents(e.target.value) }))}
            />
          </div>
          <div style={{ marginBottom: 6 }} />
          <button
            className="btn solid"
            disabled={savingKey === key}
            onClick={() => saveJackpot(key)}
          >
            Save jackpot
          </button>
        </section>
      ))}
    </div>
  );
}