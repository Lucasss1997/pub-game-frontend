import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearToken } from '../lib/auth';

export default function TopNav() {
  const [me, setMe] = useState({ pubName: '' });
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/me');
        if (mounted) setMe(data || {});
      } catch (e) {
        // If token invalid, send user to login
        nav('/login');
      }
    })();
    return () => { mounted = false; };
  }, [nav]);

  const s = styles();

  const isActive = (path) => loc.pathname === path;

  const onLogout = () => {
    clearToken();
    nav('/login', { replace: true });
  };

  return (
    <header style={s.header}>
      <div style={s.left}>
        <div style={s.brand}>🍻 Pub Game</div>
        <nav style={s.nav}>
          <A to="/" active={isActive('/')}>Home</A>
          <A to="/dashboard" active={isActive('/dashboard')}>Dashboard</A>
          <A to="/billing" active={isActive('/billing')}>Billing</A>
        </nav>
      </div>

      <div style={s.right}>
        {me?.pubName ? (
          <div title="Your pub" style={s.pubPill}>
            <span style={s.dot} />
            <span>{me.pubName}</span>
          </div>
        ) : null}
        <button onClick={onLogout} style={s.logout}>Logout</button>
      </div>
    </header>
  );
}

function A({ to, active, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      style={{
        padding: '8px 10px',
        borderRadius: 10,
        textDecoration: 'none',
        color: active ? '#0b1220' : '#e5e7eb',
        background: active ? '#22c55e' : 'transparent',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.15)'
      }}
    >
      {children}
    </Link>
  );
}

function styles() {
  const border = '1px solid rgba(255,255,255,0.12)';
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(15, 23, 42, 0.7)',
      color: '#e5e7eb',
      borderBottom: border,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(6px) saturate(1.1)'
    },
    left: { display: 'flex', alignItems: 'center', gap: 12 },
    brand: { fontWeight: 800, color: '#fff' },
    nav: { display: 'flex', gap: 8 },
    right: { display: 'flex', alignItems: 'center', gap: 10 },
    pubPill: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 10px', borderRadius: 999, border,
      background: 'rgba(255,255,255,0.06)', color: '#e5e7eb'
    },
    dot: {
      width: 8, height: 8, borderRadius: 999,
      background: '#22c55e', border: '1px solid rgba(255,255,255,0.35)'
    },
    logout: {
      padding: '8px 12px', borderRadius: 10,
      background: 'transparent', color: '#e5e7eb', border,
      cursor: 'pointer'
    },
  };
}
