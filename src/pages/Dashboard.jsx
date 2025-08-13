// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

function toGBP(cents) {
  const n = Number(cents || 0) / 100;
  return `£${n.toFixed(2)}`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const d = await api.get('/api/dashboard');
      setData(d);
      // optional: console warnings if backend provided
      if (d?._warnings?.length) console.warn('Dashboard warnings:', d._warnings);
    } catch (e) {
      setErr(e.message || 'Server error');
    }
  }

  useEffect(() => { load(); }, []);

  async function doLogout() {
    try { await api.post('/api/logout', {}); } catch {}
    window.location.href = '/login';
  }

  const go = (path) => () => { window.location.href = path; };

  if (err) {
    return (
      <div className="pg-screen">
        <div className="pg-card">
          <h1 className="pg-title">Dashboard</h1>
          <div className="pg-nav">
            <button className="pg-chip" onClick={go('/')}>Home</button>
            <button className="pg-chip" onClick={go('/pricing')}>New Game</button>
            <button className="pg-chip" onClick={go('/admin')}>Admin</button>
            <button className="pg-chip" onClick={go('/billing')}>Billing</button>
            <button className="pg-chip primary" onClick={doLogout}>Logout</button>
          </div>

          <div className="pg-alert">{err}</div>
          <button className="pg-button" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pg-screen">
        <div className="pg-card">
          <h1 className="pg-title">Dashboard</h1>
          <div className="pg-nav">
            <button className="pg-chip" onClick={go('/')}>Home</button>
            <button className="pg-chip" onClick={go('/pricing')}>New Game</button>
            <button className="pg-chip" onClick={go('/admin')}>Admin</button>
            <button className="pg-chip" onClick={go('/billing')}>Billing</button>
            <button className="pg-chip primary" onClick={doLogout}>Logout</button>
          </div>
          Loading…
        </div>
      </div>
    );
  }

  const { pub, products = [], stats = {} } = data;

  return (
    <div className="pg-screen">
      <div className="pg-card">
        <h1 className="pg-title">Dashboard</h1>

        {/* Top menu (purple chips) */}
        <div className="pg-nav">
          <button className="pg-chip" onClick={go('/')}>Home</button>
          <button className="pg-chip" onClick={go('/pricing')}>New Game</button>
          <button className="pg-chip" onClick={go('/admin')}>Admin</button>
          <button className="pg-chip" onClick={go('/billing')}>Billing</button>
          <button className="pg-chip primary" onClick={doLogout}>Logout</button>
        </div>

        <section className="pg-block">
          <h2 className="pg-subtitle">Your Pub</h2>
          {pub ? (
            <p>
              <strong>{pub.name}</strong><br/>
              <span className="pg-muted">
                {[pub.city, pub.address].filter(Boolean).join(' • ')}
              </span>
            </p>
          ) : <p>No pub profile yet.</p>}
        </section>

        <section className="pg-block">
          <h2 className="pg-subtitle">Games</h2>
          {products.length ? (
            <ul className="pg-list">
              {products.map(p => (
                <li key={p.game_key}>
                  <strong>{p.name}</strong> — {toGBP(p.price_cents)} • {p.active ? 'Active' : 'Inactive'}
                  <div className="pg-row" style={{ marginTop: 8 }}>
                    <button className="pg-button ghost" onClick={go('/admin')}>
                      Edit in Admin
                    </button>
                    {p.game_key === 'crack_safe' && (
                      <button className="pg-button" onClick={go('/crack-the-safe')}>
                        Open Game
                      </button>
                    )}
                    {p.game_key === 'whats_in_the_box' && (
                      <button className="pg-button" onClick={go('/whats-in-the-box')}>
                        Open Game
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p>No products configured.</p>}
        </section>

        <section className="pg-block">
          <h2 className="pg-subtitle">Stats</h2>
          <p>Jackpot: {toGBP(stats.jackpot_cents)}</p>
        </section>
      </div>
    </div>
  );
}