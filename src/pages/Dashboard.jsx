import React from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import QRCode from 'qrcode.react';

export default function Dashboard() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://YOUR-FRONTEND-DOMAIN';
  return (
    <div style={styles.app}>
      <TopNav />
      <main style={styles.main}>
        <h1>Dashboard</h1>

        <section style={styles.section}>
          <h2>Your Pub</h2>
          <div style={styles.pubCard}>
            <div style={styles.pubHeader}>
              <span style={styles.pubName}>The King’s Arms</span>
              <span style={{...styles.statusDot, backgroundColor: 'green'}} title="Active"></span>
              <span style={styles.expiry}>Expires on 10 Aug 2025</span>
            </div>
            <div>City: Basingstoke</div>
            <div>Address: 1 High St</div>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Games</h2>
          <div style={styles.gamesGrid}>
            <div style={styles.gameCard}>
              <h3>Crack the Safe</h3>
              <p>Guess the 3-digit code to win!</p>
              <QRCode value={`${origin}/crack-the-safe`} size={80} />
              <Link to="/crack-the-safe" style={styles.playLink}>
                <button style={styles.playBtn}>Play</button>
              </Link>
            </div>

            <div style={styles.gameCard}>
              <h3>What’s in the Box</h3>
              <p>Pick the winning box!</p>
              <QRCode value={`${origin}/whats-in-the-box`} size={80} />
              <Link to="/whats-in-the-box" style={styles.playLink}>
                <button style={styles.playBtn}>Play</button>
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Stats</h2>
          <div>Players this week: 12</div>
          <div>Prizes won: 3</div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'grid', gridTemplateRows: 'auto 1fr' },
  main: { padding: 20, maxWidth: 900, margin: '0 auto' },
  section: { marginBottom: 30 },
  pubCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)' },
  pubHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  pubName: { fontWeight: 700 },
  statusDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  expiry: { marginLeft: 'auto', fontSize: 12, color: '#94a3b8' },
  gamesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  gameCard: { padding: 15, borderRadius: 8, background: 'rgba(255,255,255,0.05)', textDecoration: 'none', color: 'inherit', display:'flex', flexDirection:'column', gap:8, alignItems:'center' },
  playLink: { textDecoration: 'none' },
  playBtn: { marginTop: 10, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }
}