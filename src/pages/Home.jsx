// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './admin.css';            // reuse the Pub Game orange/purple theme

export default function Home() {
  return (
    <div className="admin-wrap">
      <div className="admin-card" style={{ marginTop: 8 }}>
        <h1 className="admin-title" style={{ fontSize: 40, marginBottom: 6 }}>
          Welcome to Pub Game
        </h1>
        <p className="admin-sub" style={{ marginBottom: 0 }}>
          Scan a QR to play, or sign in to manage your pub’s games.
        </p>
      </div>

      {/* Manager / staff */}
      <section className="admin-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          Are you a manager?
        </h2>
        <div className="actions">
          <Link className="btn solid" to="/login">Sign in</Link>
          <Link className="btn ghost" to="/register">Create account</Link>
        </div>
      </section>

      {/* Player quick links (demo/QR fallback) */}
      <section className="admin-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          Crack the Safe (player)
        </h2>
        <div className="actions">
          <Link className="btn solid" to="/crack-the-safe">Play</Link>
          <Link className="btn ghost" to="/pricing">Pricing</Link>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          What’s in the Box (player)
        </h2>
        <div className="actions">
          <Link className="btn solid" to="/whats-in-the-box">Play</Link>
          <Link className="btn ghost" to="/pricing">Pricing</Link>
        </div>
      </section>
    </div>
  );
}