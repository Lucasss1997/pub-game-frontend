import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  // TODO: wire to real pub data if you want; for now static shell
  return (
    <div className="pg-wrap">
      <div className="pg-wide pg-stack">
        <div className="pg-card">
          <h1 className="pg-title">DASHBOARD</h1>
          <p className="pg-sub">Quick actions for tonight’s games.</p>

          <div className="pg-row">
            <Link className="pg-btn" to="/admin">Admin (Prices & Jackpot)</Link>
            <Link className="pg-btn ghost" to="/raffle">Run Raffle</Link>
            <Link className="pg-btn ghost" to="/billing">Billing</Link>
          </div>
        </div>

        <div className="pg-row">
          <section className="pg-card" style={{flex:1}}>
            <h2 className="pg-title" style={{fontSize:28}}>Crack the Safe</h2>
            <p className="pg-sub">Guess the 3‑digit code to win!</p>
            <div className="pg-row">
              <Link className="pg-btn" to="/crack-the-safe">Play</Link>
            </div>
          </section>

          <section className="pg-card" style={{flex:1}}>
            <h2 className="pg-title" style={{fontSize:28}}>What’s in the Box</h2>
            <p className="pg-sub">Pick the winning box!</p>
            <div className="pg-row">
              <Link className="pg-btn" to="/whats-in-the-box">Play</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}