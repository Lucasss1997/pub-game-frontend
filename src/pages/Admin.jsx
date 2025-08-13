import React, { useEffect, useState, useMemo } from 'react';
import './admin.css';

// -------- API base detection (works with your .env/window) --------
const API_BASE =
  (typeof window !== 'undefined' && (window._APP_API_BASE || window.APP_API_BASE)) ||
  import.meta?.env?.VITE_APP_API_BASE ||
  process.env?.REACT_APP_API_BASE ||
  process.env?._APP_API_BASE ||
  '';

// unified fetch: includes cookies AND Authorization if we have a token
function apiFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('token'); // if present, send as Bearer
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { credentials: 'include', ...opts, headers });
}

// show both products even if backend returns none
const DEFAULT_PRODUCTS = [
  { game_key: 'crack_safe',       name: 'Crack the Safe Ticket',    price: '0.00', active: true },
  { game_key: 'whats_in_the_box', name: "What's in the Box Ticket", price: '0.00', active: true },
];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [diag, setDiag] = useState('');
  const [jackpot, setJackpot] = useState('0.00');

  const [products, setProducts] = useState(() => {
    const byKey = {};
    DEFAULT_PRODUCTS.forEach(p => { byKey[p.game_key] = { ...p }; });
    return byKey;
  });
  const productList = useMemo(() => Object.values(products), [products]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      setDiag('');
      try {
        // products
        const pRes = await apiFetch('/api/admin/products');
        if (!pRes.ok) throw await httpErr(pRes);
        const pJson = await pRes.json();
        const next = { ...products };
        (Array.isArray(pJson) ? pJson : []).forEach(row => {
          const key = row.game_key;
          const price = ((row.price_cents ?? 0) / 100).toFixed(2);
          next[key] = {
            game_key: key,
            name: row.name || next[key]?.name || '',
            price,
            active: !!row.active,
          };
        });
        DEFAULT_PRODUCTS.forEach(p => { if (!next[p.game_key]) next[p.game_key] = { ...p }; });
        setProducts(next);

        // jackpot
        const jRes = await apiFetch('/api/admin/jackpot');
        if (!jRes.ok) throw await httpErr(jRes);
        const jJson = await jRes.json();
        setJackpot(((jJson?.jackpot_cents ?? 0) / 100).toFixed(2));
      } catch (e) {
        setErr(e.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveJackpot() {
    setErr('');
    try {
      const res = await apiFetch('/api/admin/jackpot', {
        method: 'POST',
        body: JSON.stringify({ jackpot }),
      });
      if (!res.ok) throw await httpErr(res);
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  async function saveProducts() {
    setErr('');
    try {
      const payload = {
        products: productList.map(p => ({
          game_key: p.game_key,
          name: (p.name || '').trim(),
          price: toMoney(p.price),
          active: !!p.active,
        })),
      };
      const res = await apiFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await httpErr(res);
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
  }

  async function runDiagnostics() {
    setDiag('');
    setErr('');
    try {
      const res = await apiFetch('/api/admin/debug');
      if (!res.ok) throw await httpErr(res);
      setDiag(await res.text());
    } catch (e) {
      setErr(e.message || 'Debug failed');
    }
  }

  function setProductField(key, field, value) {
    setProducts(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }
  function toMoney(v) {
    const s = String(v ?? '').replace(/[£,\s]/g, '').trim();
    if (!s || s === '.') return '0.00';
    const n = Number(s);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  }
  function go(path) { window.location.assign(path); }

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <header className="admin-header">
          <h1>Admin</h1>
          <div className="admin-actions">
            <button className="btn ghost" onClick={() => go('/dashboard')}>Back to Dashboard</button>
            <button className="btn ghost" onClick={() => go('/pricing')}>New Game</button>
            <button className="btn ghost" onClick={() => go('/billing')}>Billing</button>
            <button className="btn danger" onClick={async () => {
              try { await apiFetch('/api/logout', { method: 'POST' }); } catch {}
              go('/login');
            }}>Logout</button>
          </div>
        </header>

        {loading && <div className="info">Loading…</div>}
        {err && <div className="error">{err}</div>}

        <div className="admin-toolbar">
          <button className="btn ghost" onClick={runDiagnostics}>Run diagnostics</button>
        </div>
        {diag && <pre className="diag-box">{diag}</pre>}

        <section className="panel">
          <h2>Jackpot</h2>
          <label className="lbl">Jackpot (£)</label>
          <input className="input" inputMode="decimal" value={jackpot}
                 onChange={e => setJackpot(e.target.value)} placeholder="0.00" />
          <div className="row">
            <button className="btn" onClick={saveJackpot}>Save jackpot</button>
          </div>
        </section>

        <section className="panel">
          <h2>Crack the Safe</h2>
          <label className="lbl">Product name</label>
          <input className="input" value={products.crack_safe?.name || ''}
                 onChange={e => setProductField('crack_safe','name',e.target.value)} />
          <label className="lbl">Ticket price (£)</label>
          <input className="input" inputMode="decimal" value={products.crack_safe?.price || '0.00'}
                 onChange={e => setProductField('crack_safe','price',e.target.value)} />
          <label className="lbl">Active</label>
          <select className="input"
                  value={products.crack_safe?.active ? 'yes':'no'}
                  onChange={e => setProductField('crack_safe','active', e.target.value==='yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </section>

        <section className="panel">
          <h2>What’s in the Box</h2>
          <label className="lbl">Product name</label>
          <input className="input" value={products.whats_in_the_box?.name || ''}
                 onChange={e => setProductField('whats_in_the_box','name',e.target.value)} />
          <label className="lbl">Ticket price (£)</label>
          <input className="input" inputMode="decimal" value={products.whats_in_the_box?.price || '0.00'}
                 onChange={e => setProductField('whats_in_the_box','price',e.target.value)} />
          <label className="lbl">Active</label>
          <select className="input"
                  value={products.whats_in_the_box?.active ? 'yes':'no'}
                  onChange={e => setProductField('whats_in_the_box','active', e.target.value==='yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <div className="row">
            <button className="btn" onClick={saveProducts}>Save all products</button>
          </div>
        </section>
      </div>
    </div>
  );
}

async function httpErr(res) {
  let msg = `HTTP ${res.status}`;
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) {
      const j = await res.json();
      if (j?.error) msg += ` · ${JSON.stringify(j)}`;
    } else {
      const t = await res.text();
      if (t) msg += ` · ${t.slice(0, 300)}`;
    }
  } catch {}
  const e = new Error(msg);
  e.status = res.status;
  return e;
}