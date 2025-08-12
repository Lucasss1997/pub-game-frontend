import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setError('');
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status} · ${(await res.text()) || 'Load failed'}`);
      const data = await res.json();

      // Convert to a keyed object for easier access
      const byKey = {};
      (Array.isArray(data.products) ? data.products : []).forEach((p) => {
        if (!p) return;
        const k = p.game_key;
        byKey[k] = {
          id: p.id ?? null,
          game_key: k,
          name: p.name || '',
          price: p.price_cents != null ? (p.price_cents / 100).toFixed(2) : '',
          active: !!p.active,
        };
      });

      // Ensure both games always exist
      setProducts([
        byKey['crack_safe'] ?? { id: null, game_key: 'crack_safe', name: '£1 Standard Entry', price: '1.00', active: true },
        byKey['whats_in_the_box'] ?? { id: null, game_key: 'whats_in_the_box', name: '£1 Standard Entry', price: '1.00', active: true },
      ]);

      // Load jackpot separately
      try {
        const jr = await fetch('/api/admin/jackpot', { credentials: 'include' });
        if (jr.ok) {
          const j = await jr.json();
          setJackpot(j?.jackpot_cents != null ? (j.jackpot_cents / 100).toFixed(2) : '');
        }
      } catch {
        /* ignore jackpot fetch error */
      }
    } catch (e) {
      setError(e.message || 'Load failed');
    }
  }

  async function saveProduct(p) {
    setError('');
    try {
      const body = {
        id: p.id ?? null,
        game_key: p.game_key,
        name: String(p.name || ''),
        price_cents: Math.round(Number(p.price || '0') * 100),
        active: !!p.active,
      };
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} · ${(await res.text()) || 'Save failed'}`);
      await fetchAdminData();
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  }

  async function saveJackpot() {
    setError('');
    try {
      const cents = Math.round(Number(jackpot || '0') * 100);
      const res = await fetch('/api/admin/jackpot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jackpot_cents: cents }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} · ${(await res.text()) || 'Save failed'}`);
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  }

  function updateLocal(idx, patch) {
    setProducts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  return (
    <div className="admin-wrap">
      <div className="admin-panel">
        <h1>ADMIN</h1>
        <p>Set ticket prices, toggle availability, and manage the jackpot.</p>

        {error && <div className="alert">{error}</div>}

        <div className="row">
          <button className="btn ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          <button className="btn" onClick={fetchAdminData}>Run diagnostics</button>
        </div>

        {/* Products */}
        {products.map((p, i) => (
          <section key={p.game_key} className="card">
            <h2>{p.game_key === 'crack_safe' ? 'Crack the Safe' : "What's in the Box"}</h2>

            <label className="field">
              <span>Product name</span>
              <input
                value={p.name}
                onChange={(e) => updateLocal(i, { name: e.target.value })}
                placeholder="Ticket name"
              />
            </label>

            <label className="field">
              <span>Ticket price (£)</span>
              <input
                inputMode="decimal"
                value={p.price}
                onChange={(e) => updateLocal(i, { price: e.target.value })}
                placeholder="1.00"
              />
            </label>

            <label className="field">
              <span>Active</span>
              <select
                value={p.active ? 'yes' : 'no'}
                onChange={(e) => updateLocal(i, { active: e.target.value === 'yes' })}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <button className="btn" onClick={() => saveProduct(p)}>Save</button>
          </section>
        ))}

        {/* Jackpot */}
        <section className="card">
          <h2>Jackpot</h2>
          <label className="field">
            <span>Jackpot (£)</span>
            <input
              inputMode="decimal"
              value={jackpot}
              onChange={(e) => setJackpot(e.target.value)}
              placeholder="0.00"
            />
          </label>
          <button className="btn" onClick={saveJackpot}>Save jackpot</button>
        </section>
      </div>
    </div>
  );
}