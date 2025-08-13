// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

function gbp(val) {
  if (val == null) return '';
  const n = Number(val) / 100;
  return n.toFixed(2);
}
function toCents(poundsString) {
  const s = String(poundsString ?? '').trim().replace(/[£,\s]/g, '');
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error('Invalid price');
  return Math.round(n * 100);
}

export default function Admin() {
  const [products, setProducts] = useState([]);        // [{id, game_key, name, price_cents, active}]
  const [jackpotCents, setJackpotCents] = useState(0); // number
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');

  // Map by game_key for easy access
  const byKey = useMemo(() => {
    const m = {};
    for (const p of products) m[p.game_key] = p;
    return m;
  }, [products]);

  async function load() {
    setErr('');
    setOkMsg('');
    setLoading(true);
    try {
      // products
      const prod = await api.get('/api/admin/products');
      setProducts(Array.isArray(prod) ? prod : (prod?.products ?? []));
      // jackpot
      const j = await api.get('/api/admin/jackpot');
      const raw = j?.jackpot_cents ?? j?.jackpot ?? 0;
      setJackpotCents(Number(raw || 0));
    } catch (e) {
      setErr(e.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function go(path) { window.location.href = path; }
  async function logout() {
    try { await api.post('/api/logout', {}); } catch {}
    go('/login');
  }

  async function saveJackpot() {
    setErr(''); setOkMsg('');
    try {
      await api.post('/api/admin/jackpot', { jackpot: (jackpotCents/100).toFixed(2) });
      setOkMsg('Jackpot saved');
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  async function saveProduct(game_key) {
    setErr(''); setOkMsg('');
    const p = byKey[game_key] || { game_key, name: '', price_cents: 0, active: false };
    try {
      await api.post('/api/admin/products', {
        products: [{
          game_key,
          name: p.name || '',
          price: (Number(p.price_cents || 0) / 100).toFixed(2),
          active: !!p.active,
        }]
      });
      setOkMsg('Saved');
      await load();
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  function updateField(game_key, field, value) {
    setProducts(prev => {
      const clone = [...prev];
      const idx = clone.findIndex(x => x.game_key === game_key);
      if (idx >= 0) {
        clone[idx] = { ...clone[idx], [field]: value };
      } else {
        clone.push({ id: null, game_key, name: '', price_cents: 0, active: false, [field]: value });
      }
      return clone;
    });
  }

  const gameList = [
    { key: 'crack_safe', label: 'Crack the Safe' },
    { key: 'whats_in_the_box', label: "What's in the Box" },
  ];

  return (
    <div className="pg-screen">
      <div className="pg-card" style={{ maxWidth: 920 }}>
        <h1 className="pg-title">Admin</h1>

        {/* Top nav */}
        <div className="pg-nav">
          <button className="pg-chip" onClick={() => go('/dashboard')}>Back to Dashboard</button>
          <button className="pg-chip" onClick={() => go('/pricing')}>New Game</button>
          <button className="pg-chip" onClick={() => go('/billing')}>Billing</button>
          <button className="pg-chip primary" onClick={logout}>Logout</button>
        </div>

        {err && <div className="pg-alert">{err}</div>}
        {okMsg && <div className="pg-alert" style={{ borderColor: '#15803d', background: '#dcfce7', color:'#14532d' }}>{okMsg}</div>}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            {/* Jackpot block */}
            <section className="pg-block">
              <h2 className="pg-subtitle">Jackpot</h2>
              <div style={{ maxWidth: 420 }}>
                <label className="pg-muted">Jackpot (£)</label>
                <input
                  className="pg-input"
                  inputMode="decimal"
                  value={gbp(jackpotCents)}
                  onChange={(e) => {
                    try {
                      const cents = toCents(e.target.value);
                      setJackpotCents(cents);
                    } catch {
                      // keep last value if invalid
                    }
                  }}
                />
                <div className="pg-row" style={{ marginTop: 10 }}>
                  <button className="pg-button" onClick={saveJackpot}>Save Jackpot</button>
                </div>
              </div>
            </section>

            {/* Products */}
            {gameList.map(g => {
              const p = byKey[g.key] || { name: '', price_cents: 0, active: true };
              return (
                <section key={g.key} className="pg-block">
                  <h2 className="pg-subtitle">{g.label}</h2>
                  <div style={{ maxWidth: 560 }}>
                    <label className="pg-muted">Product name</label>
                    <input
                      className="pg-input"
                      value={p.name}
                      onChange={(e)=>updateField(g.key,'name', e.target.value)}
                      placeholder={`${g.label} Ticket`}
                    />
                    <div style={{ height: 10 }} />
                    <label className="pg-muted">Ticket price (£)</label>
                    <input
                      className="pg-input"
                      inputMode="decimal"
                      value={gbp(p.price_cents)}
                      onChange={(e)=>{
                        try {
                          updateField(g.key,'price_cents', toCents(e.target.value));
                        } catch {
                          /* ignore invalid while typing */
                        }
                      }}
                      placeholder="1.00"
                    />
                    <div style={{ height: 10 }} />
                    <label className="pg-muted">Active</label>
                    <select
                      className="pg-input"
                      value={p.active ? 'yes' : 'no'}
                      onChange={(e)=>updateField(g.key,'active', e.target.value === 'yes')}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <div className="pg-row" style={{ marginTop: 12 }}>
                      <button className="pg-button" onClick={() => saveProduct(g.key)}>Save</button>
                      {g.key === 'crack_safe' && (
                        <button className="pg-button ghost" onClick={() => go('/crack-the-safe')}>Open Game</button>
                      )}
                      {g.key === 'whats_in_the_box' && (
                        <button className="pg-button ghost" onClick={() => go('/whats-in-the-box')}>Open Game</button>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}