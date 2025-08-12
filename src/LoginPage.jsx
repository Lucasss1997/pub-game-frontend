import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './lib/api';
import { setToken } from './lib/auth';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Please enter your email and password.');
    try {
      setLoading(true);
      setInfo('Contacting server…');
      const data = await api.post('/api/login', { email, password });
      if (!data?.token) throw new Error('No token returned');
      setToken(data.token);
      nav('/dashboard', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Login failed');
      setInfo('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.shell}>
      <main style={s.main}>
        <form onSubmit={onSubmit} style={s.card}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtext}>Sign in to manage your pub games.</p>

          {info && <div style={s.info}>{info}</div>}
          {err && <div style={s.err}>{err}</div>}

          <label style={s.field}>
            <span style={s.label}>Email</span>
            <input style={s.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pub.com" autoComplete="email" required />
          </label>

          <label style={s.field}>
            <span style={s.label}>Password</span>
            <div style={{ position:'relative' }}>
              <input style={{ ...s.input, paddingRight:44 }}
                type={showPwd ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={s.eye}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" style={s.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div style={s.meta}>
            <span style={s.muted}>Need an account?</span>{' '}
            <Link to="#" style={s.link} onClick={e => e.preventDefault()}>Ask your admin</Link>
          </div>
        </form>
      </main>
      <footer style={s.footer}>© {new Date().getFullYear()} Pub Game</footer>
    </div>
  );
}

const c = { border:'rgba(255,255,255,0.08)', sub:'#94a3b8', brand1:'#22c55e', brand2:'#16a34a' };
const s = {
  shell:{minHeight:'100vh',background:'linear-gradient(180deg,#0b1220,#0f172a)',color:'#e5e7eb',
    fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',display:'grid',gridTemplateRows:'1fr auto'},
  main:{display:'grid',placeItems:'center',padding:20},
  card:{width:'min(480px,92vw)',background:'linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))',
    border:`1px solid ${c.border}`,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,.08),0 6px 6px rgba(0,0,0,.05)',padding:20,display:'grid',gap:14},
  title:{margin:0,fontSize:24,fontWeight:800,color:'#fff'},
  subtext:{margin:0,color:c.sub},
  field:{display:'grid',gap:6},
  label:{fontSize:13,color:c.sub},
  input:{width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${c.border}`,background:'rgba(15,23,42,.7)',color:'#e5e7eb'},
  eye:{position:'absolute',right:8,top:6,height:32,width:32,borderRadius:10,border:`1px solid ${c.border}`,
    background:'rgba(255,255,255,.06)',color:'#e5e7eb',cursor:'pointer'},
  submit:{padding:'10px 14px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${c.brand1},${c.brand2})`,
    color:'#0b1220',fontWeight:800,cursor:'pointer'},
  meta:{textAlign:'center',marginTop:4}, muted:{color:c.sub}, link:{color:c.brand1,textDecoration:'none'},
  err:{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.35)',color:'#fecaca',padding:10,borderRadius:10},
  info:{background:'rgba(59,130,246,.12)',border:'1px solid rgba(59,130,246,.35)',color:'#bfdbfe',padding:10,borderRadius:10},
  footer:{padding:14,textAlign:'center',color:'#64748b',borderTop:`1px solid ${c.border}`,background:'rgba(15,23,42,.7)'}
};