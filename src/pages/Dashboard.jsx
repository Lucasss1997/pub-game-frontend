import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';

// Minimal, dependency-free, polished dashboard UI.
// Drop this in as src/pages/Dashboard.jsx
export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setErr('');
      setLoading(true);
      const d = await api.get('/api/dashboard');
      setData(d);
    } catch (e) {
      setErr(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const d = await api.get('/api/dashboard');
      setData(d);
    } catch (e) {
      setErr(e.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const onLogout = () => {
    clearToken();
    nav('/login', { replace: true });
  };

  const styles = getStyles();

  const pubs = data?.pubs || [];

  return (
    <div style={styles.appShell}>
      {/* Top Bar */}
      <header style={styles.header}>
        <div style={styles.brandWrap}>
          <div style={styles.logo}>🍻</div>
          <div>
            <div style={styles.brand}>Pub Game Console</div>
            <div style={styles.subBrand}>Dashboard</div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button onClick={onRefresh} style={styles.button} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={onLogout} style={{ ...styles.button, ...styles.buttonGhost }}>Logout</button>
        </div>
      </header>

      {/* Content */}
      <main style={styles.main}>
        {/* Status / Errors */}
        {err && (
          <div style={styles.alertError}>
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: 1 }).map((_, i) => (
              <div key={i} style={styles.cardSkeleton}>
                <div style={styles.skelTitle} />
                <div style={styles.skelLine} />
                <div style={styles.skelLine} />
                <div style={styles.skelBadgeRow}>
                  <div style={styles.skelBadge} />
                  <div style={styles.skelBadge} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && pubs.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <h2 style={styles.emptyTitle}>No pub linked</h2>
            <p style={styles.emptyText}>Your account doesn’t have a pub associated yet.</p>
          </div>
        )}

        {/* Pub cards */}
        {!loading && pubs.length > 0 && (
          <div style={styles.grid}>
            {pubs.map((p) => (
              <article key={p.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.emojiBadge}>🏷️</div>
                  <h3 style={styles.cardTitle}>{p.name}</h3>
                </div>

                <div style={styles.cardBody}>
                  {p.city && (
                    <div style={styles.kvRow}>
                      <span style={styles.k}>City</span>
                      <span style={styles.v}>{p.city}</span>
                    </div>
                  )}
                  {p.address && (
                    <div style={styles.kvRow}>
                      <span style={styles.k}>Address</span>
                      <span style={styles.v}>{p.address}</span>
                    </div>
                  )}
                  <div style={styles.kvRow}>
                    <span style={styles.k}>Active</span>
                    <span style={{ ...styles.badge, background: p.active ? '#0ea5e9' : '#9ca3af' }}>
                      {String(p.active)}
                    </span>
                  </div>
                  <div style={styles.kvRow}>
                    <span style={styles.k}>ID</span>
                    <span style={styles.code}>{p.id}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button style={{ ...styles.button, ...styles.buttonPrimary }}>Manage Games</button>
                  <button style={{ ...styles.button, ...styles.buttonGhost }}>Edit Details</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} Pub Game</span>
      </footer>
    </div>
  );
}

function getStyles() {
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  const radius = 16;
  const pad = 16;
  const font = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  return {
    appShell: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 100%)',
      color: '#e5e7eb',
      fontFamily: font,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      backdropFilter: 'saturate(1.2) blur(6px)',
      background: 'rgba(15, 23, 42, 0.7)',
      zIndex: 10,
    },
    brandWrap: { display: 'flex', alignItems: 'center', gap: 12 },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      display: 'grid',
      placeItems: 'center',
      boxShadow: shadow,
      fontSize: 20,
    },
    brand: { fontSize: 16, fontWeight: 700, color: '#fff' },
    subBrand: { fontSize: 12, color: '#94a3b8' },
    headerActions: { display: 'flex', gap: 10 },

    main: { padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 16,
      alignItems: 'start',
    },

    // Cards
    card: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      boxShadow: shadow,
      overflow: 'hidden',
      transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: 16,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    emojiBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(34,197,94,0.15)',
    },
    cardTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' },
    cardBody: { padding: 16, display: 'grid', gap: 8 },
    cardFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      padding: 16,
      borderTop: '1px solid rgba(255,255,255,0.08)',
    },

    // Key/Value rows
    kvRow: {
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      alignItems: 'center',
      gap: 10,
    },
    k: { color: '#94a3b8', fontSize: 13 },
    v: { color: '#e5e7eb', fontSize: 14 },
    code: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 13,
      background: 'rgba(15,23,42,0.7)',
      padding: '6px 8px',
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.1)',
    },

    // Buttons
    button: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '8px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'transform .15s ease, background .15s ease, border-color .15s ease',
    },
    buttonGhost: {
      background: 'transparent',
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      border: 'none',
      color: '#0b1220',
      fontWeight: 700,
    },

    // Alerts / Empty
    alertError: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.35)',
      color: '#fecaca',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    empty: {
      textAlign: 'center',
      border: '1px dashed rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 28,
      color: '#94a3b8',
      background: 'rgba(255,255,255,0.04)',
    },
    emptyIcon: { fontSize: 36, marginBottom: 6 },
    emptyTitle: { margin: '6px 0', color: '#e5e7eb' },
    emptyText: { margin: 0 },

    // Skeletons
    cardSkeleton: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: 16,
      boxShadow: shadow,
      display: 'grid',
      gap: 10,
      overflow: 'hidden',
    },
    skelTitle: {
      height: 18,
      width: '60%',
      background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))',
      borderRadius: 6,
      animation: 'pulse 1.6s ease-in-out infinite',
    },
    skelLine: {
      height: 12,
      width: '100%',
      background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))',
      borderRadius: 6,
      animation: 'pulse 1.6s ease-in-out infinite',
    },
    skelBadgeRow: { display: 'flex', gap: 8, marginTop: 4 },
    skelBadge: {
      height: 22,
      width: 80,
      background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))',
      borderRadius: 999,
      animation: 'pulse 1.6s ease-in-out infinite',
    },

    footer: {
      padding: 14,
      textAlign: 'center',
      color: '#64748b',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(15, 23, 42, 0.7)',
    },
  };
}
