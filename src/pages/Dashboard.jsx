import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pub, setPub] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard', { credentials: 'include' });
      // Be defensive about shapes coming back
      const data = res || {};
      setPub(data.pub || null);
      setStats(data.stats || null);
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      setErr(
        (e && (e.message || e.error || e.statusText)) ||
        'Could not load dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function logout() {
    try { await api.post('/api/logout', {}, { credentials: 'include' }); } catch {}
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className="pg-wrap">
      <div className="pillnav" style={{ justifyContent: 'flex-end', gap: 12 }}>
        <a className="btn small ghost" href="/">HOME</a>
        <a className="btn small ghost" href="/billing">BILLING</a>
        <button className="btn small ghost" onClick={logout}>LOGOUT</button>
      </div>

      <h1>Dashboard</h1>

      {err && (
        <div className="card" style={{ background:'#ffd2de', borderColor:'#b31432', color:'#7a1030' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>{String(err)}</div>
          <button className="btn small" onClick={load}>RETRY</button>
        </div>
      )}

      {loading && <div className="card"><strong>Loading…</strong></div>}

      {!loading && !err && (
        <>
          <div className="card">
            <div className="section-title">Your Pub</div>
            {pub ? (
              <div className="grid cols-2">
                <div>
                  <div style={{ fontWeight: 900 }}>{pub.name}</div>
                  <div className="meta">{pub.city}</div>
                  <div className="meta">{pub.address}</div>
                </div>
                <div>
                  <div className="meta">License expires</div>
                  <div style={{ fontWeight: 900 }}>{pub.expires_on || '—'}</div>
                </div>
              </div>
            ) : <div className="meta">No pub on file.</div>}
          </div>

          <div className="grid cols-2">
            <div className="card">
              <div className="section-title">Crack the Safe</div>
              <div className="meta">
                Ticket: £{fmtPrice(products.find(p => p.game_key==='crack_the_safe')?.price_cents)}
              </div>
              <div className="game-panel actions">
                <a className="btn" href="/crack-the-safe">Play</a>
              </div>
            </div>

            <div className="card">
              <div className="section-title">What’s in the Box</div>
              <div className="meta">
                Ticket: £{fmtPrice(products.find(p => p.game_key==='whats_in_the_box')?.price_cents)}
              </div>
              <div className="game-panel actions">
                <a className="btn" href="/whats-in-the-box">Play</a>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">Stats</div>
            {stats ? (
              <div className="grid cols-3">
                <Stat label="Players this week" value={stats.players_this_week} />
                <Stat label="Prizes won" value={stats.prizes_won} />
                <Stat label="Jackpot" value={`£${fmtPrice(stats.jackpot_cents)}`} />
              </div>
            ) : <div className="meta">No stats yet.</div>}
          </div>
          <div className="pg-spacer" />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="meta">{label}</div>
      <div style={{ fontWeight: 900, fontSize: 20 }}>{value ?? '—'}</div>
    </div>
  );
}

function fmtPrice(cents) {
  const n = Number.isFinite(+cents) ? +cents : 0;
  return (n / 100).toFixed(2);
}