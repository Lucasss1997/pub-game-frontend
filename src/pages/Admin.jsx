// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const pounds = (cents) => (cents / 100).toFixed(2);
const toCents = (v) => Math.max(0, Math.round(parseFloat(v || '0') * 100));

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // editable products (per‑game ticket/options)
  const [products, setProducts] = useState([
    { game_key: 'crack', name: 'Crack the Safe Ticket', price_cents: 200, active: true },
    { game_key: 'box',   name: 'What’s in the Box Ticket', price_cents: 200, active: true },
  ]);

  // jackpot (shared pot)
  const [jackpot, setJackpot] = useState(0);

  useEffect(() => {
    (async () => {
      setErr(''); setOk('');
      try {
        setLoading(true);
        // Expect: { products: [{id?, game_key, name, price_cents, active}] }
        const p = await api.get('/api/admin/products');
        if (p?.products) setProducts(p.products);

        // Expect: { jackpot_cents: number }
        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch (e) {
        setErr(e.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function patchProduct(idx, patch) {
    setProducts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  }

  async function saveProduct(idx) {
    setErr(''); setOk('');
    try {
      const row = products[idx];
      await api.post('/api/admin/products', {
        game_key: row.game_key,
        name: row.name,
        price_cents: row.price_cents,
        active: !!row.active,
      });
      setOk('Product saved.');
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  async function saveJackpot() {
    setErr(''); setOk('');
    try {
      await api.post('/api/admin/jackpot', { jackpot_cents: jackpot });
      setOk('Jackpot saved.');
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-wide pg-stack">
        <div className="pg-card">
          <h1 className="pg-title">ADMIN</h1>
          <p className="pg-sub">Set ticket prices, toggle availability, and manage the jackpot.</p>
          {loading && <div>Loading…</div>}
          {err && <div className="pg-bad">{err}</div>}
          {ok && <div className="pg-good">{ok}</div>}
          <div className="pg-row" style={{ marginTop: 8 }}>
            <a href="/dashboard" className="pg-btn ghost">Back to Dashboard</a>
          </div>
        </div>

        {/* Products (per‑game ticket config) */}
        <div className="pg-row">
          {products.map((p, idx) => (
            <section key={p.game_key} className="pg-card" style={{ flex: 1, minWidth: 300 }}>
              <h2 className="pg-title" style={{ fontSize: 28 }}>
                {p.game_key === 'crack' ? 'Crack the Safe' : 'What’s in the Box'}
              </h2>

              <label className="pg-field">
                <span className="pg-label">Product name</span>
                <input
                  className="pg-input"
                  value={p.name}
                  onChange={(e) => patchProduct(idx, { name: e.target.value })}
                />
              </label>

              <label className="pg-field">
                <span className="pg-label">Ticket price (£)</span>
                <input
                  className="pg-number"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pounds(p.price_cents)}
                  onChange={(e) => patchProduct(idx, { price_cents: toCents(e.target.value) })}
                />
              </label>

              <label className="pg-field">
                <span className="pg-label">Active</span>
                <select
                  className="pg-select"
                  value={p.active ? '1' : '0'}
                  onChange={(e) => patchProduct(idx, { active: e.target.value === '1' })}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </label>

              <div className="pg-row" style={{ marginTop: 8 }}>
                <button className="pg-btn" onClick={() => saveProduct(idx)}>Save</button>
              </div>
            </section>
          ))}
        </div>

        {/* Jackpot */}
        <section className="pg-card">
          <h2 className="pg-title" style={{ fontSize: 28 }}>Jackpot</h2>
          <div className="pg-row">
            <label className="pg-field" style={{ flex: 1 }}>
              <span className="pg-label">Jackpot amount (£)</span>
              <input
                className="pg-number"
                type="number"
                step="0.01"
                min="0"
                value={pounds(jackpot)}
                onChange={(e) => setJackpot(toCents(e.target.value))}
              />
            </label>
          </div>
          <div className="pg-row" style={{ marginTop: 8 }}>
            <button className="pg-btn" onClick={saveJackpot}>Save jackpot</button>
          </div>
        </section>
      </div>
    </div>
  );
}