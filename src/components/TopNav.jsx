// Drop this in: src/components/TopNav.jsx
// Reusable top navigation matching your dark UI.
// Usage:
//   <TopNav title="Dashboard" onLogout={() => { clearToken(); nav('/login', { replace: true }); }} />
//   <TopNav title="Sign in" hideLogout />

import React from 'react';

export default function TopNav({ title = 'Dashboard', rightSlot = null, hideLogout = false, onLogout }) {
  const s = styles();
  return (
    <header style={s.header}>
      <div style={s.brandWrap}>
        <div style={s.logo}>🍻</div>
        <div>
          <div style={s.brand}>Pub Game Console</div>
          <div style={s.subBrand}>{title}</div>
        </div>
      </div>

      <div style={s.actions}>
        {rightSlot}
        {!hideLogout && (
          <button onClick={onLogout} style={{ ...s.button, ...s.buttonGhost }}>Logout</button>
        )}
      </div>
    </header>
  );
}

function styles() {
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  return {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      backdropFilter: 'saturate(1.2) blur(6px)',
      background: 'rgba(15, 23, 42, 0.7)',
      zIndex: 10,
    },
    brandWrap: { display: 'flex', alignItems: 'center', gap: 12 },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      display: 'grid',
      placeItems: 'center',
      boxShadow: shadow,
      fontSize: 20,
    },
    brand: { fontSize: 16, fontWeight: 700, color: '#fff' },
    subBrand: { fontSize: 12, color: '#94a3b8' },
    actions: { display: 'flex', gap: 10 },
    button: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '8px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'transform .15s ease, background .15s ease, border-color .15s ease',
    },
    buttonGhost: {
      background: 'transparent',
    },
  };
}
