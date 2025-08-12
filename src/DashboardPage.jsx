import React, { useEffect, useState } from 'react';
import { api } from './lib/api';
import { clearToken } from './lib/auth';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pubs, setPubs] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await api.get('/healthz'); // confirm API works
        const me = await api.get('/api/me'); // validate token
        void me;
        const dash = await api.get('/api/dashboard');
        setPubs(dash.pubs || []);
      } catch (e) {
        setErr(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => { clearToken(); window.location.assign('/login'); };

  const card = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:18 };
  const badge = (on) => ({ width:10, height:10, borderRadius:'50%', background:on ? '#22c55e' : '#ef4444', display:'inline-block' });

  const publicBase = window.location.origin; // your frontend base for QR links
  const qrSrc = (path) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicBase + path)}`;

  return (
    <div style={{ display:'grid', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ margin:0 }}>Pub Dashboard</h1>
        <button onClick={logout} style={btn}>Logout</button>
      </div>

      {loading && <p style={{ color:'#94a3b8' }}>Loading…</p>}
      {err && <div style={alert}>{err}</div>}

      {!loading && !err && pubs.map((p) => (
        <div key={p.id} style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={badge(p.active)} /> <strong>{p.name}</strong>
            <span style={{ marginLeft:'auto', color:'#94a3b8', fontSize:13 }}>
              {p.expires_at ? `Expires ${new Date(p.expires_at).toLocaleDateString()}` : 'No expiry'}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:12 }}>
            <div>
              <div><b>City</b> <span style={muted}>{p.city || '—'}</span></div>
              <div><b>Address</b> <span style={muted}>{p.address || '—'}</span></div>
              <div><b>ID</b> <span style={muted}>{p.id}</span></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Crack the Safe QR */}
              <div style={gameCard}>
                <h3 style={{ marginTop:0 }}>Crack the Safe</h3>
                <img alt="Crack Safe QR" src={qrSrc('/play/crack-the-safe')} style={{ width:'100%', borderRadius:12 }} />
                <a href="/play/crack-the-safe" style={link}>Open page</a>
              </div>
              {/* What's in the Box QR */}
              <div style={gameCard}>
                <h3 style={{ marginTop:0 }}>What’s in the Box</h3>
                <img alt="Box QR" src={qrSrc('/play/whats-in-the-box')} style={{ width:'100%', borderRadius:12 }} />
                <a href="/play/whats-in-the-box" style={link}>Open page</a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const btn = { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)',
  background:'rgba(255,255,255,0.08)', color:'#e2e8f0', cursor:'pointer' };
const muted = { color:'#94a3b8' };
const alert = { background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.35)', color:'#fecaca', padding:10, borderRadius:10 };
const gameCard = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:12 };
const link = { display:'inline-block', marginTop:8, color:'#22c55e', textDecoration:'none', fontWeight:700 };