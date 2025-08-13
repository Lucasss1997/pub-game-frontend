// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const d = await api.get('/api/dashboard');
      setData(d);
      if (d?._warnings?.length) {
        console.warn('Dashboard warnings:', d._warnings);
      }
    } catch (e) {
      setErr(e.message || 'Server error');
    }
  }

  useEffect(() => { load(); }, []);

  if (err) {
    return (
      <div className="pg-screen">
        <div className="pg-card">
          <h1 className="pg-title">Dashboard</h1>
          <div className="pg-alert">{err}</div>
          <button className="pg-button" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pg-screen">
        <div className="pg-card"><h1 className="pg-title">Dashboard</h1>Loading…</div>
      </div>
    );
  }

  const { pub, products, stats } = data;
  return (
    <div className="pg-screen">
      <div className="pg-card">
        <h1 className="pg-title">Dashboard</h1>

        <section className="pg-block">
          <h3>Your Pub</h3>
          {pub ? (
            <p><strong>{pub.name}</strong><br/>{pub.city}{pub.address ? ` • ${pub.address}` : ''}</p>
          ) : (
            <p>No pub profile yet.</p>
          )}
        </section>

        <section className="pg-block">
          <h3>Games</h3>
          {products?.length ? (
            <ul className="pg-list">
              {products.map((p) => (
                <li key={p.game_key}>
                  <strong>{p.name}</strong> — £{(p.price_cents || 0 / 100).toFixed ? (p.price_cents/100).toFixed(2) : '0.00'} {p.active ? '• Active' : '• Inactive'}
                </li>
              ))}
            </ul>
          ) : <p>No products configured.</p>}
        </section>

        <section className="pg-block">
          <h3>Stats</h3>
          <p>Jackpot: £{((stats?.jackpot_cents || 0)/100).toFixed(2)}</p>
        </section>
      </div>
    </div>
  );
}