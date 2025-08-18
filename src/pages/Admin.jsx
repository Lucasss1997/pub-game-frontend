// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../ui/pubgame-theme.css';
import { api } from '../lib/api'; // works because api.js now exports BOTH named and default

const GAMES = [
  { key: 'safe', title: 'Crack the Safe' },
  { key: 'box',  title: "What's in the Box" },
];

function ProductEditor({ gameKey, product, onChange, onSave, saving }) {
  return (
    <div className="admin-card" style={{ marginTop: 8 }}>
      <div className="field">
        <span>Product name</span>
        <input
          value={product.name}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
          placeholder="£1 Standard Entry"
        />
      </div>

      <div className="field">
        <span>Ticket price (£)</span>
        <input
          type="number"
          step="0.01"
          value={product.price_pounds}
          onChange={(e) => onChange({ ...product, price_pounds: e.target.value })}
        />
      </div>

      <div className="field">
        <span>Active</span>
        <select
          value={product.active ? 'Yes' : 'No'}
          onChange={(e) => onChange({ ...product, active: e.target.value === 'Yes' })}
        >
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <button className="btn solid" disabled={saving} onClick={() => onSave(gameKey, product)}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

export default function Admin() {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Per-game state
  const [jackpots, setJackpots] = useState({ safe: '0.00', box: '0.00' });
  const [products, setProducts]   = useState({
    safe: { name: '', price_pounds: '1.00', active: true },
    box:  { name: '', price_pounds: '1.00', active: true },
  });

  async function load() {
    setError('');
    try {
      const cfg = await api.getAdminConfig(); // { jackpots: {safe,box}, products: {safe,box}}
      if (cfg?.jackpots) {
        setJackpots({
          safe: (Number(cfg.jackpots.safe || 0) / 100).toFixed(2),
          box:  (Number(cfg.jackpots.box  || 0) / 100).toFixed(2),
        });
      }
      if (cfg?.products) {
        const next = { ...products };
        for (const key of ['safe', 'box']) {
          const p = cfg.products[key];
          if (p) {
            next[key] = {
              name: p.name || '',
              price_pounds: (Number(p.price_cents || 0) / 100).toFixed(2),
              active: !!p.active,
            };
          }
        }
        setProducts(next);
      }
    } catch (e) {
      setError(e.message || 'Failed to load admin config');
    }
  }

  useEffect(() => { load(); /* on mount */ }, []);

  async function handleSaveProduct(gameKey, product) {
    setError('');
    setSaving(true);
    try {
      await api.saveProduct(gameKey, product);
    } catch (e) {
      setError(e.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveJackpot(gameKey) {
    setError('');
    setSaving(true);
    try {
      await api.saveJackpot(gameKey, jackpots[gameKey]);
    } catch (e) {
      setError(e.message || 'Failed to save jackpot');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <div className="actions" style={{ flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn ghost">Back to Dashboard</Link>
          <Link to="/dashboard?new" className="btn ghost">New Game</Link>
          <Link to="/billing" className="btn ghost">Billing</Link>
          <Link to="/login" className="btn solid" onClick={() => localStorage.removeItem('token')}>Logout</Link>
        </div>

        <h1 className="admin-title">Admin</h1>
        {!!error && <div className="alert error">{error}</div>}
      </div>

      {GAMES.map(({ key, title }) => {
        const product = products[key];
        return (
          <div key={key} className="admin-card">
            <h2 className="section-title">{title}</h2>

            <ProductEditor
              gameKey={key}
              product={product}
              onChange={(p) => setProducts((prev) => ({ ...prev, [key]: p }))}
              onSave={handleSaveProduct}
              saving={saving}
            />

            <div style={{ height: 10 }} />

            <div className="field">
              <span>Jackpot (£):</span>
              <input
                type="number"
                step="0.01"
                value={jackpots[key]}
                onChange={(e) => setJackpots((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>

            <button
              className="btn solid"
              style={{ marginTop: 6 }}
              disabled={saving}
              onClick={() => handleSaveJackpot(key)}
            >
              {saving ? 'Saving…' : 'Save Jackpot'}
            </button>
          </div>
        );
      })}
    </div>
  );
}