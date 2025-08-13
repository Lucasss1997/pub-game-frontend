import React from "react";
import { Link } from "react-router-dom";
import "../ui/pubgame-theme.css";

export default function Home() {
  return (
    <div className="pg-wrap">
      <div className="card max">
        <h1 className="page-title">Welcome to Pub Game</h1>
        <p style={{ marginBottom: 14 }}>
          Scan a QR to play, or sign in to manage your pub’s games.
        </p>

        <div className="toolbar">
          <Link className="btn" to="/login">Sign in (manager)</Link>
          <Link className="btn light" to="/crack-the-safe">Crack the Safe (player)</Link>
          <Link className="btn light" to="/whats-in-the-box">What’s in the Box (player)</Link>
        </div>
      </div>
    </div>
  );
}