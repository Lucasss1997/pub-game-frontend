import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';

export default function Dashboard() {
  const [pub, setPub] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get('/api/dashboard');
        setPub(d?.pubs?.[0] || null);
      } catch (e) {
        setErr(e.message || 'Failed to load');
      }
    })();
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const crackURL = pub ? `${origin}/enter/${pub.id}/crack_the_safe` : '';
  const boxURL   = pub ? `${origin}/enter/${pub.id}/whats_in_the_box` : '';

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', color:'#e5e7eb'}}>
      <main style={{maxWidth:980, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <header style={{display:'flex', alignItems:'center', gap:10}}>
          <h1 style={{margin:0}}>Pub Dashboard</h1>
          <div style={{marginLeft:'auto'}}>
            <button onClick={()=>{ clearToken(); window.location.href='/login';}} style={smallBtn}>Logout</button>
          </div>
        </header>

        {err && <div style={bad}>{err}</div>}
        {!pub && !err && <p>Loading…</p>}
        {pub && (
          <>
            <section style={panel}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <strong style={{fontSize:18}}>{pub.name}</strong>
                <span title={pub.active ? 'Active':'Inactive'} style={{
                  width:10, height:10, borderRadius:'50%', background: pub.active ? 'limegreen' : 'gray'
                }}/>
                {pub.expires_at && <span style={{marginLeft:'auto', color:'#94a3b8'}}>Expires: {new Date(pub.expires_at).toLocaleDateString()}</span>}
              </div>
              <div>City: {pub.city}</div>
              <div>Address: {pub.address}</div>
            </section>

            <section style={panel}>
              <h2 style={{marginTop:0}}>QR codes for entry</h2>
              <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'}}>
                <GameQR title="Crack the Safe" url={crackURL} />
                <GameQR title="What’s in the Box" url={boxURL} />
              </div>
              <p style={{color:'#94a3b8', marginTop:10}}>Players scan → pay entry → get added to the live raffle.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function GameQR({ title, url }) {
  const img = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  return (
    <div style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16}}>
      <h3 style={{marginTop:0}}>{title}</h3>
      <img src={img} alt={`QR for ${title}`} width="220" height="220" style={{borderRadius:12}} />
      <div style={{marginTop:8, fontSize:12, color:'#94a3b8', wordBreak:'break-all'}}>{url}</div>
    </div>
  );
}

const panel = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 };
const smallBtn = { padding:'6px 10px', border:'none', borderRadius:8, background:'#334155', color:'#e5e7eb', cursor:'pointer' };
const bad = { background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 };