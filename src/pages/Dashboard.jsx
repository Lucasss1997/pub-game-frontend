// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';            // uses your _APP_API_BASE
import '../ui/pubgame-theme.css';            // keep your theme

export default function Dashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      // Try helper first
      const res = await api.get('/api/dashboard');
      setData(res);
    } catch (e) {
      // If helper misconfigured, fall back to plain fetch
      try {
        const base = import.meta?.env?._APP_API_BASE || (window._APP_API_BASE ?? '');
        const r = await fetch(`${base}/api/dashboard`, { credentials: 'include' });
        if (!r.ok) {
          if (r.status === 401) {
            // not logged in → send to login
            nav('/login');
            return;
          }
          throw new Error(`HTTP ${r.status}`);
        }
        setData(await r.json());
      } catch (e2) {
        setErr(e2.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function logout() {
    try { localStorage.removeItem('token'); } catch {}
    nav('/login');
  }

  const s = styles;
  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <h1 style={s.h1}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={s.ghostBtn} onClick={() => nav('/')}>Home</button>
          <button style={s.ghostBtn} onClick={() => nav('/billing')}>Billing</button>
          <button style={s.ghostBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      {loading && <div style={s.card}>Loading…</div>}

      {!!err && (
        <div style={{ ...s.card, ...s.cardError }}>
          {err}
          <div><button style={s.btn} onClick={load}>Retry</button></div>
        </div>
      )}

      {!loading && !err && data && (
        <>
          {/* Pub summary */}
          <section style={s.card}>
            <h2 style={s.h2}>Your Pub</h2>
            <div style={s.kv}><span style={s.k}>Name</span><span>{data.pub?.name ?? '—'}</span></div>
            <div style={s.kv}><span style={s.k}>City</span><span>{data.pub?.city ?? '—'}</span></div>
            <div style={s.kv}><span style={s.k}>Address</span><span>{data.pub?.address ?? '—'}</span></div>
          </section>

          {/* Games */}
          <section style={s.grid}>
            <div style={s.card}>
              <h3 style={s.h3}>Crack the Safe</h3>
              <p style={s.p}>Guess the 3‑digit code to win!</p>
              <button style={s.btn} onClick={() => nav('/crack-the-safe')}>Play</button>
            </div>
            <div style={s.card}>
              <h3 style={s.h3}>What’s in the Box</h3>
              <p style={s.p}>Pick the winning box!</p>
              <button style={s.btn} onClick={() => nav('/whats-in-the-box')}>Play</button>
            </div>
          </section>

          {/* Admin shortcuts */}
          <section style={s.card}>
            <h3 style={s.h3}>Admin</h3>
            <p style={s.p}>Set ticket prices, toggle availability and jackpot.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={s.btn} onClick={() => nav('/admin')}>Open Admin</button>
              <button style={s.ghostBtn} onClick={() => nav('/pricing')}>Pricing</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    padding: 20,
    background: '#e89117', // orange background
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 0 16px',
  },
  h1: { margin: 0, color: '#26008a', fontSize: 32, fontWeight: 800 },
  h2: { margin: '0 0 8px', color: '#26008a', fontSize: 24, fontWeight: 800 },
  h3: { margin: '0 0 8px', color: '#26008a', fontSize: 20, fontWeight: 800 },
  p: { margin: '0 0 12px', color: '#2b1b00' },
  card: {
    background: '#f7c35a',
    borderRadius: 18,
    boxShadow: '0 8px 0 #c97810',
    padding: 16,
    marginBottom: 16,
    border: '3px solid #4c23c8',
  },
  cardError: {
    background: '#ffd1d6',
    color: '#7a0022',
    borderColor: '#7a0022',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  btn: {
    background: '#4c23c8',
    color: 'white',
    border: '3px solid #2b0ea7',
    borderRadius: 12,
    padding: '10px 14px',
    fontWeight: 700,
  },
  ghostBtn: {
    background: '#f7c35a',
    color: '#26008a',
    border: '3px solid #4c23c8',
    borderRadius: 12,
    padding: '8px 12px',
    fontWeight: 700,
  },
  kv: {
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
    margin: '4px 0',
  },
  k: { minWidth: 80, color: '#26008a', fontWeight: 700 },
};