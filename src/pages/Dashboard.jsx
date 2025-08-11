/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const nav = useNavigate();
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError('');
      const d = await api.get('/api/dashboard');
      setPubs(Array.isArray(d?.pubs) ? d.pubs : []);
    } catch (e) {
      setError(e?.message || 'Failed to load dashboard');
      // if unauthorized, send to login
      if (String(e?.message || '').toLowerCase().includes('401')) {
        nav('/login');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const s = styles();
  const first = pubs[0] || {};
  const expiry = getExpiry(first);

  return (
    <div style={s.app}>
      <TopNav />

      <main style={s.main}>
        <div style={s.headerRow}>
          <h1 style={s.h1}>Dashboard</h1>
          <button style={s.refreshBtn} onClick={onRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && <div style={s.alertError}>{error}</div>}

        {loading ? (
          <div style={s.grid}>
            <CardSkeleton />
          </div>
        ) : pubs.length === 0 ? (
          <div style={s.empty}>No pub linked to this account yet.</div>
        ) : (
          <div style={s.grid}>
            {pubs.map((p) => {
              const exp = getExpiry(p);
              const status = computeStatus(!!p.active && !isExpired(exp), exp);
              return (
                <article key={p.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <div style={s.emoji}>🏷️</div>
                    <h3 style={s.title}>
                      {p.name}
                      <span title={status.label} style={{ ...s.dot, background: status.color }} />
                    </h3>
                  </div>
                  <div style={s.body}>
                    {p.city && (
                      <Row k="City" v={p.city} />
                    )}
                    {p.address && (
                      <Row k="Address" v={p.address} />
                    )}
                    {exp && (
                      <Row
                        k="Subscription"
                        v={
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            Expires {formatDate(exp)}
                            {isExpired(exp) && <Badge tone="red">Expired</Badge>}
                            {!isExpired(exp) && isExpiringSoon(exp) && <Badge tone="amber">Renew soon</Badge>}
                          </span>
                        }
                      />
                    )}
                    <Row k="ID" v={<code style={s.code}>{p.id}</code>} />
                  </div>
                  <div style={s.footer}>
                    <button style={s.btnPrimary} onClick={() => nav('/billing')}>Manage / Renew</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer style={s.footer}>© {new Date().getFullYear()} Pub Game</footer>
    </div>
  );
}

function Row({ k, v }) {
  const s = styles();
  return (
    <div style={s.row}>
      <span style={s.k}>{k}</span>
      <span style={s.v}>{v}</span>
    </div>
  );
}

function Badge({ tone = 'amber', children }) {
  const colors = {
    red: { bg: 'rgba(239,68,68,0.18)', br: '1px solid rgba(239,68,68,0.35)', fg: '#fecaca' },
    amber: { bg: 'rgba(245,158,11,0.18)', br: '1px solid rgba(245,158,11,0.35)', fg: '#fde68a' },
    green: { bg: 'rgba(34,197,94,0.18)', br: '1px solid rgba(34,197,94,0.35)', fg: '#bbf7d0' },
  }[tone];
  return (
    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: colors.bg, border: colors.br, color: colors.fg }}>
      {children}
    </span>
  );
}

function CardSkeleton() {
  const s = styles();
  return (
    <div style={s.card}> 
      <div style={s.cardHeader}>
        <div style={{...s.skel, width: 36, height: 36, borderRadius: 10}} />
        <div style={{...s.skel, height: 18, width: '50%'}} />
      </div>
      <div style={s.body}>
        <div style={{...s.skel, height: 12, width: '70%'}} />
        <div style={{...s.skel, height: 12, width: '60%'}} />
        <div style={{...s.skel, height: 12, width: '40%'}} />
      </div>
    </div>
  );
}

function getExpiry(p){
  return p?.expires_at || p?.subscription_expires_at || null;
}
function isExpired(date){
  const d = new Date(date);
  return !isNaN(d) && d.getTime() < Date.now();
}
function isExpiringSoon(date){
  const d = new Date(date);
  if (isNaN(d)) return false;
  const diff = d.getTime() - Date.now();
  const days = Math.ceil(diff / (1000*60*60*24));
  return diff >= 0 && days <= 7;
}
function computeStatus(active, expiryDate){
  const GREY = '#9ca3af', GREEN = '#22c55e', AMBER = '#f59e0b', RED = '#ef4444';
  if (!expiryDate) return active ? { color: GREEN, label: 'Active' } : { color: GREY, label: 'Inactive' };
  const d = new Date(expiryDate);
  if (isNaN(d)) return active ? { color: GREEN, label: 'Active' } : { color: GREY, label: 'Inactive' };
  const diff = d.getTime() - Date.now();
  const days = Math.ceil(diff / (1000*60*60*24));
  if (diff < 0) return { color: RED, label: `Expired (${formatDate(expiryDate)})` };
  if (days <= 7) return { color: AMBER, label: `Expiring soon (${formatDate(expiryDate)})` };
  return { color: GREEN, label: `Active (${formatDate(expiryDate)})` };
}
function formatDate(date){
  const d = new Date(date);
  if (isNaN(d)) return String(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function styles(){
  const border = '1px solid rgba(255,255,255,0.08)';
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  return {
    app: { minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 100%)', color: '#e5e7eb', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', display: 'grid', gridTemplateRows: 'auto 1fr auto' },
    main: { padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' },
    h1: { margin: 0, color: '#fff' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 },

    card: { background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border, borderRadius: 18, boxShadow: shadow, overflow: 'hidden' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: border },
    emoji: { width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(34,197,94,0.15)' },
    title: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)', display: 'inline-block' },
    body: { padding: 16, display: 'grid', gap: 10 },
    footer: { padding: 16, borderTop: border, display: 'flex', justifyContent: 'flex-end' },

    row: { display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 10 },
    k: { color: '#94a3b8', fontSize: 13 },
    v: { color: '#e5e7eb', fontSize: 14 },
    code: { background: 'rgba(15,23,42,0.7)', padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' },

    btnPrimary: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#0b1220', fontWeight: 700, padding: '8px 12px', borderRadius: 10, cursor: 'pointer' },
    refreshBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb', padding: '8px 12px', borderRadius: 10, cursor: 'pointer' },

    alertError: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', padding: 12, borderRadius: 12, marginBottom: 16 },
    empty: { textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 16, padding: 28, color: '#94a3b8', background: 'rgba(255,255,255,0.04)' },

    skel: { background: 'linear-gradient(90deg, rgba(148,163,184,0.25), rgba(148,163,184,0.12), rgba(148,163,184,0.25))', borderRadius: 6, animation: 'pulse 1.6s ease-in-out infinite' },
    footerBar: { padding: 14, textAlign: 'center', color: '#64748b', borderTop: border, background: 'rgba(15, 23, 42, 0.7)' },
    footer: { padding: 14, textAlign: 'center', color: '#64748b', borderTop: border, background: 'rgba(15, 23, 42, 0.7)' },
  };
}
