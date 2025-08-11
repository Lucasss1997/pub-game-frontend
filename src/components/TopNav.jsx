import React from 'react';
import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <nav className="top-nav" style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f8f8f8' }}>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/billing">Billing</Link>
    </nav>
  );
}
