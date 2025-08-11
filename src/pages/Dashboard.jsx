import React from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function Dashboard() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const urlSafe = `${origin}/play/crack-the-safe`;
  const urlBox  = `${origin}/play/whats-in-the-box`;

  // No extra libs needed: we use a lightweight QR image API
  const qr = (data) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(data)}`;

  return (
    <div style={s.app}>
      <TopNav />
      <main style={s.main}>
        <h1>Dashboard</h1>

        <section style={s.section}>
          <h2>Your Pub</h2>
          <div style={s.pubCard}>
            <div style={s.pubHeader}>
              <span style={s.pubName}>The King’s Arms</span>
              <span style={{...s.statusDot, backgroundColor: 'green'}} title="Active"></span>
              <span style={s.expiry}>Expires on 10 Aug 2025</span>
            </div>
            <div>City: Basingstoke</div>
            <div>Address: 1 High St</div>
          </div>
        </section>

        <section style={s.section}>
          <h2>Games (manager view)</h2>
          <div style={s.gamesGrid}>
            <Link to="/crack-the-safe" style={s.gameCard}>
              <h3>Crack the Safe</h3>
              <p>Guess the 3-digit code to win!</p>
              <button style={s.playBtn}>Open manager view</button>
            </Link>
            <Link to="/whats-in-the-box" style={s.gameCard}>
              <h3>What’s in the Box</h3>
              <p>Pick the winning box!</p>
              <button style={s.playBtn}>Open manager view</button>
            </Link>
          </div>
        </section>

        <section style={s.section}>
          <h2>Player QR Codes</h2>
          <div style={s.qrGrid}>
            <div style={s.qrCard}>
              <h3>Crack the Safe (player)</h3>
              <img alt="Crack the Safe QR" src={qr(urlSafe)} style={s.qrImg} />
              <a href={urlSafe} target="_blank" rel="noreferrer" style={s.link}>{urlSafe}</a>
            </div>
            <div style={s.qrCard}>
              <h3>What’s in the Box (player)</h3>
              <img alt="What’s in the Box QR" src={qr(urlBox)} style={s.qrImg} />
              <a href={urlBox} target="_blank" rel="noreferrer" style={s.link}>{urlBox}</a>
            </div>
          </div>
          <p style={s.note}>Tip: print these or display them on-screen for players to scan.</p>
        </section>

        <section style={s.section}>
          <h2>Stats</h2>
          <div>Players this week: 12</div>
          <div>Prizes won: 3</div>
        </section>
      </main>
    </div>
  );
}

const s = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'grid', gridTemplateRows: 'auto 1fr' },
  main: { padding: 20, maxWidth: 1000, margin: '0 auto' },
  section: { marginBottom: 30 },
  pubCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)' },
  pubHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  pubName: { fontWeight: 700 },
  statusDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  expiry: { marginLeft: 'auto', fontSize: 12, color: '#94a3b8' },
  gamesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  gameCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)', textDecoration: 'none', color: 'inherit' },
  playBtn: { marginTop: 10, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#0f172a', fontWeight: 700, cursor: 'pointer' },

  qrGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  qrCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'grid', gap: 8, justifyItems: 'center' },
  qrImg: { width: 240, height: 240, borderRadius: 8, background: '#fff' },
  link: { color: '#22c55e', wordBreak: 'break-all', textDecoration: 'none' },
  note: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
};