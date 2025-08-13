// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { get, post, clearToken } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Dashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);

  const fetchDash = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await get('/api/dashboard');
      setData(res || {});
    } catch (e) {
      // Normalize / surface the error
      const status = e?.status || e?.response?.status;
      const msg =
        e?.message ||
        e?.response?.data?.error ||
        e?.response?.data ||
        'Server error';
      console.error('Dashboard fetch failed:', { status, msg, raw: e });

      // If unauthorized, send back to login
      if (status === 401) {
        clearToken();
        return nav('/login', { replace: true });
      }
      setErr(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }, [nav]);

  useEffect(() => {
    fetchDash();
  }, [fetchDash]);

  async function onLogout() {
    try { await post('/api/logout'); } catch {}
    clearToken();
    nav('/login', { replace: true });
  }

  // --- UI helpers ---
  const pounds = (cents) =>
    typeof cents === 'number'
      ? `£${(cents / 100).toFixed(2)}`
      : '£0.00';

  const products = data?.products || [];
  const pub = data?.pub || null;
  const stats = data?.stats || { jackpot_cents: 0, players_this_week: 0, prizes_won: 0 };

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <div className="actions" style={{ marginBottom: 8 }}>
          <Link className="btn ghost" to="/">Home</Link>
          <Link className="btn ghost" to="/pricing">New Game</Link>
          <Link className="btn ghost" to="/admin">Admin</Link>
          <Link className="btn ghost" to="/billing">Billing</Link>
          <button className="btn solid" onClick={onLogout}>Logout</button>
        </div>

        <h1 className="admin-title" style={{ marginTop: 0 }}>Dashboard</h1>

        {loading && (
          <div className="diag">Loading…</div>
        )}

        {!!err && !loading && (
          <div className="alert error">
            {err}
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn" onClick={fetchDash}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !err && (
          <>
            <section className="admin-card" style={{ marginTop: 12 }}>
              <h2 className="section-title">Your Pub</h2>
              {pub ? (
                <div>
                  <div><strong>Name:</strong> {pub.name}</div>
                  {pub.address && <div><strong>Address:</strong> {pub.address}</div>}
                  {pub.city && <div><strong>City:</strong> {pub.city}</div>}
                  {pub.expires_on && <div><strong>Sub expires:</strong> {new Date(pub.expires_on).toLocaleDateString()}</div>}
                </div>
              ) : (
                <div>No pub profile yet.</div>
              )}
            </section>

            <section className="admin-card">
              <h2 className="section-title">Games</h2>
              {products.length === 0 ? (
                <div>No games configured yet.</div>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {products.map((p) => (
                    <li key={p.game_key} style={{ margin: '8px 0' }}>
                      <strong>{p.name || p.game_key}</strong>
                      {' — '}
                      {p.price_cents != null ? pounds(p.price_cents) : '£0.00'}
                      {' \u00B7 '}
                      {p.active ? 'Active' : 'Inactive'}
                      <div className="actions" style={{ marginTop: 6 }}>
                        <Link className="btn ghost" to="/admin">Edit in Admin</Link>
                        {p.game_key === 'crack_safe' && (
                          <Link className="btn" to="/crack-the-safe">Open Game</Link>
                        )}
                        {p.game_key === 'whats_in_box' && (
                          <Link className="btn" to="/whats-in-the-box">Open Game</Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-card">
              <h2 className="section-title">Stats</h2>
              <div><strong>Jackpot:</strong> {pounds(stats.jackpot_cents)}</div>
              <div><strong>Players this week:</strong> {stats.players_this_week || 0}</div>
              <div><strong>Prizes won:</strong> {stats.prizes_won || 0}</div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}