import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

const API_BASE = (process.env.REACT_APP_API_BASE || 'https://pub-game-backend.onrender.com').replace(/\/$/, '');

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('');
  const [health, setHealth] = useState('');
  const [serverData, setServerData] = useState(null);

  async function checkHealth() {
    setHealth('Checking…');
    try {
      const res = await fetch(`${API_BASE}/healthz`, { method: 'GET' });
      const data = await res.json();
      setHealth(data?.ok ? 'OK' : `Bad (${res.status})`);
    } catch (e) {
      setHealth('Network error');
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setStatus('');
    setServerData(null);

    if (!email || !password) {
      setErr('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setStatus(`Contacting ${API_BASE} …`);

      // 1) Login
      const loginRes = await api.post('/api/login', { email, password });
      setServerData(loginRes);
      if (!loginRes?.token) {
        setErr('Login succeeded but no token was returned.');
        setStatus('Unexpected response from server.');
        return;
      }

      // 2) Save token
      setToken(loginRes.token);
      setStatus('Token saved. Verifying session…');

      // 3) Verify
      await api.get('/api/me');

      setStatus('Success! Redirecting…');
      nav('/dashboard', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Login failed');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const s = getStyles();

  return (
    <div style={s.shell}>
      <TopNav title="Sign in" hideLogout />

      <main style={s.main}>
        <form onSubmit={onSubmit} style={s.card}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtext}>Sign in to manage your pub games.</p>

          {/* Env / debug */}
          <div style={s.envRow}>
            <span style={s.envLabel}>API:</span>
            <code style={s.envCode}>{API_BASE}</code>
            <button type="button" onClick={checkHealth} style={s.pingBtn}>Ping</button>
            <span style={s.pingStatus}>{health}</span>
          </div>

          {status && <div style={s.alertInfo}>{status}</div>}
          {err && <div style={s.alertError}>{err}</div>}

          <label style={s.field}>
            <span style={s.label}>Email</span>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pub.com"
              autoComplete="email"
              required
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...s.input, paddingRight: 44 }}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={s.revealBtn}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" style={s.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div style={s.metaRow}>
            <span style={s.muted}>Need an account?</span>{' '}
            <Link to="#" style={s.link} onClick={(e) => e.preventDefault()}>
              Ask your admin
            </Link>
          </div>

          {serverData && !serverData.token && (
            <details style={s.debugWrap}>
              <summary style={s.debugSummary}>Debug: server response (no token returned)</summary>
              <pre style={s.debugPre}>{JSON.stringify(serverData, null, 2)}</pre>
            </details>
          )}
        </form>
      </main>

      <footer style={s.footer}>
        <span>© {new Date().getFullYear()} Pub Game</span>
      </footer>
    </div>
  );
}

function getStyles() {
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  const font = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  const colors = {
    bg1: '#0b1220',
    bg2: '#0f172a',
    panel: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
    border: 'rgba(255,255,255,0.08)',
    text: '#e5e7eb',
    sub: '#94a3b8',
    brandStart: '#22c55e',
    brandEnd: '#16a34a',
  };

  return {
    shell: {
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${colors.bg1} 0%, ${colors.bg2} 100%)`,
      color: colors.text,
      fontFamily: font,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    },
    main: { display: 'grid', placeItems: 'center', padding: 20 },

    card: {
      width: 'min(480px, 92vw)',
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: 20,
      boxShadow: shadow,
      padding: 20,
      display: 'grid',
      gap: 14,
    },
    title: { margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' },
    subtext: { margin: 0, color: '#94a3b8' },

    envRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' },
    envLabel: { opacity: 0.9 },
    envCode: { background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 6 },
    pingBtn: { padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' },
    pingStatus: { minWidth: 60 },

    field: { display: 'grid', gap: 6 },
    label: { fontSize: 13, color: '#94a3b8' },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      outline: 'none',
      background: 'rgba(15,23,42,0.7)',
      color: '#e5e7eb',
    },
    revealBtn: {
      position: 'absolute',
      right: 8,
      top: 6,
      height: 32,
      width: 32,
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      background: 'rgba(255,255,255,0.06)',
      color: '#e5e7eb',
      cursor: 'pointer',
    },

    submit: {
      padding: '10px 14px',
      borderRadius: 12,
      border: 'none',
      background: `linear-gradient(135deg, ${colors.brandStart}, ${colors.brandEnd})`,
      color: '#0b1220',
      fontWeight: 800,
      cursor: 'pointer',
    },

    metaRow: { textAlign: 'center', marginTop: 4 },
    muted: { color: '#94a3b8' },
    link: { color: '#22c55e', textDecoration: 'none' },

    alertError: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.35)',
      color: '#fecaca',
      padding: 10,
      borderRadius: 10,
    },
    alertInfo: {
      background: 'rgba(59,130,246,0.12)',
      border: '1px solid rgba(59,130,246,0.35)',
      color: '#bfdbfe',
      padding: 10,
      borderRadius: 10,
    },

    debugWrap: { marginTop: 10 },
    debugSummary: { cursor: 'pointer' },
    debugPre: {
      marginTop: 6,
      maxHeight: 220,
      overflow: 'auto',
      background: 'rgba(0,0,0,0.35)',
      borderRadius: 8,
      padding: 10,
      border: '1px solid rgba(255,255,255,0.12)',
    },

    footer: {
      padding: 14,
      textAlign: 'center',
      color: '#64748b',
      borderTop: `1px solid ${colors.border}`,
      background: 'rgba(15, 23, 42, 0.7)',
    },
  };
}