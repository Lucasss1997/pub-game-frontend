import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';

export default function Dashboard() {
  const [pub, setPub] = useState(null);
  const [err, setErr] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get('/api/dashboard');
        setPub(d?.pubs?.[0] || null);
      } catch (e) { setErr(e.message || 'Failed to load pub'); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get('/api/stats'); // optional if you have it
        setStats(s);
      } catch {}
    })();
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const crackURL = pub ? `${origin}/enter/${pub.id}/crack_the_safe` : '';
  const boxURL   = pub ? `${origin}/enter/${pub.id}/whats_in_the_box` : '';

  return (
    <div style={styles.app}>
      <main style={styles.main}>
        <header style={{display:'flex', alignItems:'center', gap:10}}>
          <h1 style={{margin:0}}>Pub Dashboard</h1>
          <div style={{marginLeft:'auto'}}>
            <button onClick={()=>{ clearToken(); window.location.href='/login'; }} style={styles.smallBtn}>Logout</button>
          </div>
        </header>

        {err && <div style={styles.bad}>{err}</div>}
        {!pub && !err && <p>Loading…</p>}

        {pub && (
          <>
            <section style={styles.card}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <strong style={{fontSize:18}}>{pub.name}</strong>
                <span title={pub.active ? 'Active':'Inactive'} style={{width:10,height:10,borderRadius:'50%',background:pub.active?'limegreen':'gray'}}/>
                <span style={{marginLeft:'auto', color:'#94a3b8'}}>
                  {pub.city} • {pub.address}
                </span>
              </div>
              {pub.expires_at && (
                <div style={{color:'#94a3b8'}}>Subscription expires: {new Date(pub.expires_at).toLocaleDateString()}</div>
              )}
            </section>

            <section style={styles.card}>
              <h2 style={{marginTop:0}}>QR codes for entry</h2>
              <div style={styles.grid}>
                <GameQR title="Crack the Safe" url={crackURL} />
                <GameQR title="What’s in the Box" url={boxURL} />
              </div>
              <p style={{color:'#94a3b8', marginTop:10}}>Players scan → pay entry (Stripe, £GBP) → added to live raffle.</p>
            </section>

            <section style={styles.card}>
              <h2 style={{marginTop:0}}>Stats</h2>
              <div style={styles.statsRow}>
                <Stat label="Players (7d)" value={stats?.players7d ?? '—'} />
                <Stat label="Entries (today)" value={stats?.entriesToday ?? '—'} />
                <Stat label="Prizes awarded" value={stats?.prizes ?? '—'} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function GameQR({ title, url }) {
  if (!url) return null;
  const img = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  return (
    <div style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16}}>
      <h3 style={{marginTop:0}}>{title}</h3>
      <img src={img} alt={`QR for ${title}`} width="220" height="220" style={{borderRadius:12}} />
      <div style={{marginTop:8, fontSize:12, color:'#94a3b8', wordBreak:'break-all'}}>{url}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{display:'grid', gap:6}}>
      <div style={{fontSize:28, fontWeight:800}}>{value}</div>
      <div style={{color:'#94a3b8'}}>{label}</div>
    </div>
  );
}

const styles = {
  app:{ minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' },
  main:{ maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16 },
  card:{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 },
  grid:{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))' },
  statsRow:{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))' },
  smallBtn:{ padding:'6px 10px', border:'none', borderRadius:8, background:'#334155', color:'#e5e7eb', cursor:'pointer' },
  bad:{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 }
};