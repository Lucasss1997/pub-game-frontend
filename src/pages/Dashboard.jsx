// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { get, clearToken } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Dashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const d = await get('/api/dashboard');
      setData(d);
    } catch (e) {
      if (e.status === 401) nav('/login', { replace: true });
      else setErr(e.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function logout() {
    clearToken();
    nav('/login', { replace: true });
  }

  return (
    <div className="page-wrap">
      <div className="toolbar">
        <Link className="btn ghost" to="/">Home</Link>
        <Link className="btn ghost" to="/enter/DEMO_PUB/crack">New Game</Link>
        <Link className="btn ghost" to="/admin">Admin</Link>
        <Link className="btn ghost" to="/billing">Billing</Link>
        <button className="btn solid" onClick={logout}>Logout</button>
      </div>

      <h1 className="title">Dashboard</h1>

      {loading && <p>Loading...</p>}
      {err && (
        <div className="alert error">
          {err} &nbsp; <button className="btn ghost" onClick={load}>Retry</button>
        </div>
      )}

      {data && (
        <>
          {/* keep your existing layout/style; showing minimal info */}
          <section className="card">
            <h2 className="section-title">Games</h2>
            {(data.products || []).map((p) => (
              <div key={p.game_key} style={{ marginBottom: 10 }}>
                <strong>{p.name}</strong> — £{(p.price_cents/100).toFixed(2)} · {p.active ? 'Active' : 'Inactive'}
              </div>
            ))}
          </section>

          <section className="card">
            <h2 className="section-title">Stats</h2>
            <div>Jackpot: £{((data.stats?.jackpot_cents || 0)/100).toFixed(2)}</div>
          </section>
        </>
      )}
    </div>
  );
}