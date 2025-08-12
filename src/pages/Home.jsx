import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const card = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:18 };
  const btn = { display:'inline-block', marginTop:12, padding:'10px 14px', borderRadius:12, background:'#22c55e', color:'#0b1220', fontWeight:800, textDecoration:'none' };

  return (
    <div style={{ display:'grid', gap:16 }}>
      <h1 style={{ margin:0 }}>Welcome to Pub Game</h1>
      <p style={{ color:'#94a3b8' }}>Scan a QR to play, or sign in to manage your pub’s games.</p>
      <div style={card}>
        <h3>Are you a manager?</h3>
        <Link to="/login" style={btn}>Sign in</Link>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={card}>
          <h3>Crack the Safe (player)</h3>
          <Link to="/play/crack-the-safe" style={btn}>Play</Link>
        </div>
        <div style={card}>
          <h3>What’s in the Box (player)</h3>
          <Link to="/play/whats-in-the-box" style={btn}>Play</Link>
        </div>
      </div>
    </div>
  );
}