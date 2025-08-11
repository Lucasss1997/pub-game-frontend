import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken, isLoggedIn } from '../lib/auth';

export default function TopNav({ title, hideLogout }) {
  const nav = useNavigate();
  const out = () => { clearToken(); nav('/login', { replace: true }); };
  const s = styles;

  return (
    <header style={s.header}>
      <div style={s.brand}>
        <span role="img" aria-label="beer">🍺</span>&nbsp;Pub Game
      </div>
      <nav style={s.nav}>
        <Link to="/" style={s.a}>Home</Link>
        {isLoggedIn() && <Link to="/dashboard" style={s.a}>Dashboard</Link>}
        {isLoggedIn() && <Link to="/billing" style={s.a}>Billing</Link>}
        {isLoggedIn() && !hideLogout && (
          <button onClick={out} style={s.logout}>Logout</button>
        )}
      </nav>
      {title ? <div style={s.title}>{title}</div> : null}
    </header>
  );
}

const styles = {
  header: { display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center',
    gap:12, padding:'12px 16px', background:'rgba(15,23,42,0.75)',
    borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, zIndex:10 },
  brand: { fontWeight:800, color:'#fff' },
  nav: { display:'flex', gap:12, alignItems:'center' },
  a: { color:'#cbd5e1', textDecoration:'none', padding:'6px 10px',
       border:'1px solid rgba(255,255,255,0.08)', borderRadius:10 },
  logout: { padding:'6px 10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.08)', color:'#e2e8f0', cursor:'pointer' },
  title: { gridColumn:'1 / -1', color:'#94a3b8', fontSize:12 }
};