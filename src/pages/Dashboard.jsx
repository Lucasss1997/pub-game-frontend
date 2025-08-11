import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import QRCode from 'qrcode.react';
import { api, logoutAndRedirect } from '../lib/api';

export default function Dashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pubs, setPubs] = useState([]);

  // Redirect to /login if no token at all
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      nav('/login', { replace: true });
    }
  }, [nav]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/dashboard');
        if (!mounted) return;
        setPubs(data.pubs || []);
        setErr('');
      } catch (e) {
        // Invalid/missing token → force logout
        if (String(e.message).toLowerCase().includes('token')) {
          logoutAndRedirect();
          return;
        }
        setErr(e.message || 'Load failed');
      } finally {
        mounted = false;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://YOUR-FRONTEND-DOMAIN';

  return (
    <div style={styles.app}>
      <TopNav />
      <main style={styles.main}>
        <h1>Dashboard</h1>

        {loading && <div style={styles.notice}>Loading…</div>}
        {!!err && !loading && <div style={styles.error}>{err}</div>}

        <section style={styles.section}>
          <h2>Your Pub</h2>
          {pubs.length === 0 ? (
            <div style={styles.notice}>No pub linked to this user yet.</div>
          ) : (
            pubs.map((p) => (
              <div key={p.id} style={styles.pubCard}>
                <div style={styles.pubHeader}>
                  <span style={styles.pubName}>{p.name}</span>
                  <span
                    style={{ ...styles.statusDot, backgroundColor: p.active ? 'green' : 'gray' }}
                    title={p.active ? 'Active' : 'Inactive'}
                  />
                  {p.expires_at && (
                    <span style={styles.expiry}>
                      Expires {new Date(p.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div>City: {p.city || '-'}</div>
                <div>Address: {p.address || '-'}</div>
                <div>ID: {p.id}</div>
              </div>
            ))
          )}
        </section>

        <section style={styles.section}>
          <h2>Games</h2>
          <div style={styles.gamesGrid}>
            <div style={styles.gameCard}>
              <h3>Crack the Safe</h3>
              <p>Guess the 3-digit code to win!</p>
              <QRCode value={`${origin}/crack-the-safe`} size={96} />
              <Link to="/crack-the-safe" style={styles.playLink}>
                <button style={styles.playBtn}>Play</button>
              </Link>
            </div>

            <div style={styles.gameCard}>
              <h3>What’s in the Box</h3>
              <p>Pick the winning box!</p>
              <QRCode value={`${origin}/whats-in-the-box`} size={96} />
              <Link to="/whats-in-the-box" style={styles.playLink}>
                <button style={styles.playBtn}>Play</button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'grid', gridTemplateRows: 'auto 1fr' },
  main: { padding: 20, maxWidth: 900, margin: '0 auto' },
  section: { marginBottom: 30 },
  notice: { padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.06)' },
  error: { padding: 12, borderRadius: 8, background: '#7f1d1d', color: '#fff' },

  pubCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)' },
  pubHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  pubName: { fontWeight: 700 },
  statusDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  expiry: { marginLeft: 'auto', fontSize: 12, color: '#94a3b8' },

  gamesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  gameCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  playLink: { textDecoration: 'none' },
  playBtn: { marginTop: 6, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#0f172a', fontWeight: 700, cursor: 'pointer' },
};