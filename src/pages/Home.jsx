import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={styles.app}>
      <main style={styles.main}>
        <h1 style={styles.h1}>Welcome to Pub Game</h1>
        <p style={styles.sub}>Scan a QR to play, or sign in to manage your pub’s games.</p>

        <div style={styles.grid}>
          <Card title="Are you a manager?">
            <Link to="/login" style={styles.cta}>Sign in</Link>
          </Card>

          <Card title="Crack the Safe (player)">
            <Link to="/play/crack-the-safe" style={styles.cta}>Play</Link>
          </Card>

          <Card title="What’s in the Box (player)">
            <Link to="/play/whats-in-the-box" style={styles.cta}>Play</Link>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardH}>{title}</h3>
      {children}
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#0f172a', color: '#e5e7eb' },
  main: { maxWidth: 1100, margin: '0 auto', padding: 20, display: 'grid', gap: 16 },
  h1: { margin: 0, fontSize: 36, fontWeight: 800 },
  sub: { margin: 0, color: '#94a3b8' },
  grid: { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' },
  card: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, display: 'grid', gap: 12 },
  cardH: { margin: 0 },
  cta: { display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: '#22c55e', color: '#0b1220', fontWeight: 800, textDecoration: 'none' }
};