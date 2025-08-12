import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function Dashboard(){
  const [pub,setPub] = useState(null);
  const [games,setGames] = useState([]);
  const [err,setErr] = useState('');

  useEffect(()=>{ (async()=>{
    try{
      const d = await api.get('/api/dashboard');
      setPub(d?.pubs?.[0]||null);
      // Optional: recent games if you expose it
      // const g = await api.get('/api/games/recent'); setGames(g?.list||[]);
    }catch(e){ setErr(e.message||'Load failed'); }
  })(); },[]);

  const origin = typeof window!=='undefined'?window.location.origin:'';
  const crackURL = pub ? `${origin}/enter/${pub.id}/crack_the_safe` : '';
  const boxURL   = pub ? `${origin}/enter/${pub.id}/whats_in_the_box` : '';

  const qr = (u)=>`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(u)}`;

  return (
    <div className="neon-wrap">
      <div className="neon-grid">
        <GlassCard tone="dashboard" title="DASHBOARD">
          <NeonButton onClick={()=>location.assign('/pricing')}>Start New Game</NeonButton>
          {err && <div className="bad" style={{marginTop:8}}>{err}</div>}
          <h3 style={{margin:'14px 0 6px'}}>Past Games</h3>
          <div className="tr" style={{display:'grid',gridTemplateColumns:'90px 1fr 80px',gap:8,fontWeight:700}}>
            <div>Date</div><div>Game</div><div>Prize</div>
          </div>
          {(games||[]).map((g,i)=>(
            <div key={i} className="tr" style={{display:'grid',gridTemplateColumns:'90px 1fr 80px',gap:8}}>
              <div>{new Date(g.created_at).toLocaleDateString()}</div>
              <div>{g.name}</div>
              <div>£{(g.prize_cents/100).toFixed(0)}</div>
            </div>
          ))}
        </GlassCard>

        <GlassCard tone="newgame" title="NEW GAME">
          <div className="field">
            <span>Game Type</span>
            <select className="select" defaultValue="crack_the_safe">
              <option value="crack_the_safe">Crack the Safe</option>
              <option value="whats_in_the_box">What’s in the Box</option>
            </select>
          </div>
          <div className="field">
            <span>Prize Amount (£)</span>
            <input className="input" type="number" min="0" step="1" defaultValue="100"/>
          </div>
          <NeonButton onClick={()=>location.assign('/raffle')}>Start Game</NeonButton>
        </GlassCard>

        <GlassCard tone="game" title="CRACK THE SAFE" subtitle={pub?`Live • ${pub.name}`:'Live'}>
          {pub ? (
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'grid',gap:10,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
                <div className="card" style={{background:'rgba(0,0,0,.12)'}}>
                  <h3 style={{marginTop:0}}>Player QR</h3>
                  <img alt="Crack QR" width="220" height="220" src={qr(crackURL)} style={{borderRadius:12}}/>
                  <small>{crackURL}</small>
                </div>
                <div className="card" style={{background:'rgba(0,0,0,.12)'}}>
                  <h3 style={{marginTop:0}}>Box QR</h3>
                  <img alt="Box QR" width="220" height="220" src={qr(boxURL)} style={{borderRadius:12}}/>
                  <small>{boxURL}</small>
                </div>
              </div>
            </div>
          ) : <div>Loading…</div>}
        </GlassCard>
      </div>
    </div>
  );
}