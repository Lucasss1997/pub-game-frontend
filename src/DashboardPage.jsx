import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';

// Drop-in replacement for src/pages/Dashboard.jsx
// Adds:
//  • Status legend (🟢 Active / 🟠 Expiring ≤7d / 🔴 Expired)
//  • "Renew now" button when expiring soon or expired (navigates to /billing)
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

  const s = styles();
  const pubs = data?.pubs || [];

  // Use first pub in header (adjust if multiple)
  const first = pubs[0] || {};
  const expiry = getExpiry(first);
  const headerStatus = computeStatus(!!first.active && !isExpired(expiry), expiry);

  return (
    <div style={s.appShell}>
      <TopNav
        title={first?.name || 'Dashboard'}
        active={headerStatus.color === COLORS.green}
        expiryDate={expiry}
        onLogout={onLogout}
        rightSlot={(
          <button onClick={onRefresh} style={s.refreshBtn} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
      />

      <main style={s.main}>
        {err && <div style={s.alertError}>{err}</div>}

        {/* Legend */}
        <div style={s.legendWrap}>
          <LegendItem color={COLORS.green} label="Active" />
          <LegendItem color={COLORS.amber} label="Expiring ≤ 7 days" />
          <LegendItem color={COLORS.red} label="Expired" />
        </div>

        {loading && (
          <div style={s.grid}>
            {Array.from({ length: 1 }).map((_, i) => (
              <div key={i} style={s.cardSkeleton}>
                <div style={s.skelTitle} />
                <div style={s.skelLine} />
                <div style={s.skelLine} />
                <div style={s.skelBadgeRow}>
                  <div style={s.skelBadge} />
                  <div style={s.skelBadge} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && pubs.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h2 style={s.emptyTitle}>No pub linked</h2>
            <p style={s.emptyText}>Your account doesn’t have a pub associated yet.</p>
          </div>
        )}

        {!loading && pubs.length > 0 && (
          <div style={s.grid}>
            {pubs.map((p) => {
              const exp = getExpiry(p);
              const status = computeStatus(!!p.active && !isExpired(exp), exp);
              const showRenew = status.color === COLORS.amber || status.color === COLORS.red;

              return (
                <article key={p.id} style={s.card}>
                  {/* Header with name + tiny status dot */}
                  <div style={s.cardHeader}>
                    <div style={s.emojiBadge}>🏷️</div>
                    <h3 style={s.cardTitle}>
                      {p.name}
                      <span title={status.label} style={{ ...s.statusDot, background: status.color }} />
                    </h3>
                  </div>

                  {/* Body */}
                  <div style={s.cardBody}>
                    {p.city && (
                      <div style={s.kvRow}>
                        <span style={s.k}>City</span>
                        <span style={s.v}>{p.city}</span>
                      </div>
                    )}
                    {p.address && (
                      <div style={s.kvRow}>
                        <span style={s.k}>Address</span>
                        <span style={s.v}>{p.address}</span>
                      </div>
                    )}

                    {/* Subscription */}
                    {exp && (
                      <div style={s.kvRow}>
                        <span style={s.k}>Subscription</span>
                        <span style={s.v}>
                          Expires {formatDate(exp)}
                          {status.color === COLORS.red && <span style={s.expiredBadge}>Expired</span>}
                          {status.color === COLORS.amber && <span style={s.soonBadge}>Renew soon</span>}
                        </span>
                      </div>
                    )}

                    <div style={s.kvRow}>
                      <span style={s.k}>ID</span>
                      <span style={s.code}>{p.id}</span>
                    </div>
                  </div>

                  <div style={s.cardFooter}>
                    {showRenew && (
                      <button
                        onClick={() => nav('/billing')}
                        style={{ ...s.button, ...s.buttonPrimary }}
                        title={status.color === COLORS.red ? 'Renew your subscription to reactivate' : 'Renew early to avoid interruption'}
                      >
                        Renew now
                      </button>
                    )}
                    <button style={{ ...s.button, ...s.buttonGhost }}>Edit Details</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <span>© {new Date().getFullYear()} Pub Game</span>
      </footer>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color, border: '1px solid rgba(255,255,255,0.35)' }} />
      <span style={{ color: '#cbd5e1', fontSize: 12 }}>{label}</span>
    </div>
  );
}

function getExpiry(p) {
  return p?.expires_at || p?.subscription_expires_at || null;
}

function isExpired(date) {
  try {
    const d = new Date(date);
    return !isNaN(d) && d.getTime() < Date.now();
  } catch {
    return false;
  }
}

function isExpiringSoon(date) {
  const d = new Date(date);
  if (isNaN(d)) return false;
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffMs >= 0 && diffDays <= 7;
}

export const COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  grey: '#9ca3af',
};

function computeStatus(active, expiryDate) {
  // Returns { color, label }
  let color = COLORS.grey;
  let label = 'Inactive';
  if (!expiryDate) return active ? { color: COLORS.green, label: 'Active' } : { color, label };

  const d = new Date(expiryDate);
  if (isNaN(d)) return active ? { color: COLORS.green, label: 'Active' } : { color, label };

  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return { color: COLORS.red, label: `Expired (${formatDate(expiryDate)})` };
  if (diffDays <= 7) return { color: COLORS.amber, label: `Expiring soon (${formatDate(expiryDate)})` };
  return { color: COLORS.green, label: `Active (${formatDate(expiryDate)})` };
}

function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return String(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function styles() {
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  const radius = 20;
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
    main: { padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' },

    legendWrap: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: 16,
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' },

    // Card
    card: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: radius,
      boxShadow: shadow,
      overflow: 'hidden',
      transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
    },
    cardHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' },
    emojiBadge: { width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(34,197,94,0.15)' },
    cardTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 },
    statusDot: { width: 10, height: 10, borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)', display: 'inline-block' },

    cardBody: { padding: 16, display: 'grid', gap: 8 },
    cardFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' },

    // KV rows
    kvRow: { display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 10 },
    k: { color: '#94a3b8', fontSize: 13 },
    v: { color: '#e5e7eb', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 },
    code: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, background: 'rgba(15,23,42,0.7)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' },

    // Buttons
    button: { background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', transition: 'transform .15s ease, background .15s ease, border-color .15s ease' },
    buttonGhost: { background: 'transparent' },
    buttonPrimary: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#0b1220', fontWeight: 700 },
    refreshBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb', padding: '8px 12px', borderRadius: 10 },

    // Alerts & Empty
    alertError: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', padding: 12, borderRadius: 12, marginBottom: 16 },
    empty: { textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 16, padding: 28, color: '#94a3b8', background: 'rgba(255,255,255,0.04)' },
    emptyIcon: { fontSize: 36, marginBottom: 6 },
    emptyTitle: { margin: '6px 0', color: '#e5e7eb' },
    emptyText: { margin: 0 },

    // Skeletons
    cardSkeleton: { background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, boxShadow: shadow, display: 'grid', gap: 10, overflow: 'hidden' },
    skelTitle: { height: 18, width: '60%', background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))', borderRadius: 6, animation: 'pulse 1.6s ease-in-out infinite' },
    skelLine: { height: 12, width: '100%', background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))', borderRadius: 6, animation: 'pulse 1.6s ease-in-out infinite' },
    skelBadgeRow: { display: 'flex', gap: 8, marginTop: 4 },
    skelBadge: { height: 22, width: 80, background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))', borderRadius: 999, animation: 'pulse 1.6s ease-in-out infinite' },

    expiredBadge: { marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca' },
    soonBadge: { marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#fde68a' },
    footer: { padding: 14, textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.7)' },
  };
}
