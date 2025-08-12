import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const card = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 };
  return (
    <div style={{minHeight:'100vh', background:'#0f172a', color:'#e5e7eb'}}>
      <main style={{maxWidth:960, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <h1 style={{margin:0}}>Welcome to Pub Game</h1>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
          <div style={card}>
            <h3>Are you a manager?</h3>
            <Link to="/login" style={btn}>Sign in</Link>
          </div>
          <div style={card}>
            <h3>Crack the Safe (player)</h3>
            <Link to="/play/crack-the-safe" style={btn}>Play</Link>
          </div>
          <div style={card}>
            <h3>What’s in the Box (player)</h3>
            <Link to="/play/whats-in-the-box" style={btn}>Play</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const btn = { display:'inline-block', marginTop:8, background:'#22c55e', color:'#0f172a', padding:'10px 14px', borderRadius:10, textDecoration:'none', fontWeight:800 };