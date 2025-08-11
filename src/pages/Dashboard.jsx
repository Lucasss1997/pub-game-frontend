import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';

export default function Dashboard() {
  const nav = useNavigate();

  // Data
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      setErr('');
      const d = await api.get('/api/dashboard');
      setPubs(Array.isArray(d?.pubs) ? d.pubs : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const s = styles();
  const pub = pubs[0] || {};

  // Helpers
  const statusColor = (p) => {
    const exp = p?.expires_at ? new Date(p.expires_at) : null;
    if (!exp) return p.active ? COLORS.green : COLORS.red;
    const days = (exp - new Date()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return COLORS.red;      // expired
    if (days < 7)  return COLORS.amber;    // expiring soon
    return COLORS.green;                   // healthy
  };
  const expiryLabel = (p) => {
    const exp = p?.expires_at ? new Date(p.expires_at) : null;
    if (!exp) return p.active ? 'Active' : 'Inactive';
    const days = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days < 7)  return `Expiring in ${days} day(s)`;
    return `Expires on ${exp.toLocaleDateString()}`;
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  // UI
  if (loading) return <PageShell><TopNav /><main style={s.main}><p>Loading dashboard…</p></main></PageShell>;
  if (err)     return <PageShell><TopNav /><main style={s.main}><div style={s.alertError}>{err}</div></main></PageShell>;
  if (!pubs.length) return (
    <PageShell>
      <TopNav />
      <main style={s.main}>
        <div style={s.empty}>No pub linked to your account yet.</div>
      </main>
    </PageShell>
  );

  return (
    <PageShell>
      <TopNav />
      <main style={s.main}>
        {/* Pub Header */}
        <section style={s.pubCard}>
          <div style={s.pubHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span title={expiryLabel(pub)} style={{ ...s.dot, background: statusColor(pub) }} />
              <h1 style={s.pubName}>{pub.name}</h1>
            </div>
            <div style={s.pubMeta}>{expiryLabel(pub)}</div>
          </div>

          <div style={s.pubBody}>
            <KV k="City" v={pub.city || '-'} />
            <KV k="Address" v={pub.address || '-'} />
            <KV k="Status" v={pub.active ? 'Active' : 'Inactive'} />
            {pub.expires_at && (
              <KV k="Subscription Expires" v={new Date(pub.expires_at).toLocaleDateString()} />
            )}
            <KV k="ID" v={<code style={s.code}>{pub.id}</code>} />
          </div>

          <div style={s.actions}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => nav('/billing')}>
              Manage / Renew
            </button>
            <button style={s.btn} onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </section>

        {/* Games Section */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.h2}>Games</h2>
            <Legend />
          </div>
          <div style={s.grid}> 
            <GameCard
              emoji="🧨"
              title="Crack the Safe"
              blurb="Give your punters 3 chances to guess the code. Pot rolls over nightly."
              onPlay={() => nav('/crack-the-safe')}
            />
            <GameCard
              emoji="🎁"
              title="What’s in the Box"
              blurb="20 boxes. One prize. The rest? Red herrings."
              onPlay={() => nav('/whats-in-the-box')}
            />
            {/* Add more games here later */}
          </div>
        </section>

        {/* Quick Stats (placeholder, optional) */}
        <section style={s.section}>
          <h2 style={s.h2}>This Week</h2>
          <div style={s.statsRow}>
            <Stat label="Players" value="—" />
            <Stat label="Prizes won" value="—" />
            <Stat label="Current pot" value="—" />
          </div>
        </section>
      </main>

      <footer style={s.footer}>© {new Date().getFullYear()} Pub Game</footer>
    </PageShell>
  );
}

/* ——— Small pieces ——— */
function PageShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 100%)',
      color: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      display: 'grid', gridTemplateRows: 'auto 1fr auto'
    }}>
      {children}
    </div>
  );
}

function KV({ k, v }) {
  const s = styles();
  return (
    <div style={s.row}>
      <span style={s.k}>{k}</span>
      <span style={s.v}>{v}</span>
    </div>
  );
}

function GameCard({ emoji, title, blurb, onPlay }) {
  const s = styles();
  return (
    <article style={s.card}>
      <div style={s.cardHead}>
        <div style={s.emoji}>{emoji}</div>
        <div>
          <h3 style={s.cardTitle}>{title}</h3>
          <p style={s.cardBlurb}>{blurb}</p>
        </div>
      </div>
      <div style={s.cardFoot}>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={onPlay}>Play</button>
        <button style={s.btn} onClick={() => alert('Rules coming soon')}>How it works</button>
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      minWidth: 160,
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 14,
      padding: 14,
      display: 'grid', gap: 4,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{value}</div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#cbd5e1', fontSize: 12 }}>
      <Dot c={COLORS.green} /> Active
      <Dot c={COLORS.amber} /> Expiring ≤ 7d
      <Dot c={COLORS.red} /> Expired
    </div>
  );
}
function Dot({ c }) { return <span style={{ width: 10, height: 10, borderRadius: 999, background: c, border: '1px solid rgba(255,255,255,0.35)' }} />; }

/* ——— Styles ——— */
const COLORS = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

function styles() {
  const border = '1px solid rgba(255,255,255,0.08)';
  const soft = 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))';
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  return {
    main: { padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' },
    footer: { padding: 14, textAlign: 'center', color: '#64748b', borderTop: border, background: 'rgba(15, 23, 42, 0.7)' },

    pubCard: { background: soft, border, borderRadius: 20, boxShadow: shadow, overflow: 'hidden', marginBottom: 16 },
    pubHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: border },
    pubName: { margin: 0, color: '#fff' },
    pubMeta: { fontSize: 12, color: '#94a3b8' },
    pubBody: { padding: 16, display: 'grid', gap: 8 },

    row: { display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 10 },
    k: { color: '#94a3b8', fontSize: 13 },
    v: { color: '#e5e7eb', fontSize: 14 },
    code: { background: 'rgba(15,23,42,0.7)', padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' },

    actions: { padding: 16, display: 'flex', gap: 10, borderTop: border, justifyContent: 'flex-end' },
    btn: { background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 10, cursor: 'pointer' },
    btnPrimary: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#0b1220', fontWeight: 700 },

    section: { marginTop: 20 },
    sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    h2: { margin: 0, color: '#fff' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
    card: { background: soft, border, borderRadius: 18, boxShadow: shadow, padding: 16, display: 'grid', gap: 12 },
    cardHead: { display: 'flex', alignItems: 'center', gap: 12 },
    emoji: { width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(34,197,94,0.15)', fontSize: 22 },
    cardTitle: { margin: 0, color: '#fff' },
    cardBlurb: { margin: 0, color: '#94a3b8', fontSize: 13 },
    cardFoot: { display: 'flex', gap: 10, justifyContent: 'flex-start' },

    statsRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    dot: { width: 12, height: 12, borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)' },
    alertError: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', padding: 12, borderRadius: 12, marginBottom: 16 },
    empty: { textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 16, padding: 28, color: '#94a3b8', background: 'rgba(255,255,255,0.04)' },
  };
}
