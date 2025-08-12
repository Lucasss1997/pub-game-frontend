// src/pages/Admin.jsx — full drop‑in with diagnostics
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const toPounds = (cents) =>
  (Number.isFinite(cents) ? (cents / 100).toFixed(2) : '0.00');

function parseGBP(str) {
  if (str == null) return null;
  const clean = String(str).replace(/[^0-9.]/g, '');
  if (clean === '') return null;
  const n = Number(clean);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function prettyErr(e, fallback) {
  // api.get/api.post throw { status, body, message }
  const bits = [];
  if (e?.status) bits.push(`HTTP ${e.status}`);
  if (e?.body) bits.push(typeof e.body === 'string' ? e.body : JSON.stringify(e.body));
  if (e?.message && !bits.length) bits.push(e.message);
  return bits.join(' · ') || fallback || 'Error';
}

export default function Admin() {
  const nav = useNavigate();

  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState(0); // cents
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [diag, setDiag] = useState(null); // shows /api/admin/debug

  // initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr(''); setOk(''); setDiag(null);
      try {
        const p = await api.get('/api/admin/products');
        if (!mounted) return;
        const list = (p?.products || []).map(x => ({ ...x, _price: toPounds(x.price_cents) }));
        setProducts(list);
      } catch (e) {
        if (!mounted) return;
        setErr(prettyErr(e, 'Load products failed'));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch (e) {
        // don’t overwrite a more specific error if we already have one
        setErr(prev => prev || prettyErr(e, 'Load jackpot failed'));
      }
    })();

    return () => { mounted = false; };
  }, []);

  async function runDiagnostics() {
    setDiag('Running…');
    try {
      const d = await api.get('/api/admin/debug');
      setDiag(JSON.stringify(d, null, 2));
    } catch (e) {
      setDiag(prettyErr(e, 'Debug failed'));
    }
  }

  async function saveProduct(prod) {
    setErr(''); setOk('');
    const cents = prod._price != null ? parseGBP(prod._price) : prod.price_cents;
    if (!Number.isFinite(cents)) {
      setErr('Enter a valid ticket price, e.g. 2.00');
      return;
    }
    try {
      await api.post('/api/admin/products', {
        game_key: prod.game_key,
        name: prod.name,
        price_cents: cents,
        active: !!prod.active,
      });
      setOk('Saved');
      setProducts(curr =>
        curr.map(p => p.game_key === prod.game_key
          ? { ...p, price_cents: cents, _price: toPounds(cents) }
          : p
        )
      );
    } catch (e) {
      setErr(prettyErr(e, 'Save failed'));
    }
  }

  async function saveJackpot() {
    setErr(''); setOk('');
    const asString = (jackpot / 100).toFixed(2);
    const cents = parseGBP(asString);
    if (!Number.isFinite(cents)) {
      setErr('Enter a valid jackpot amount, e.g. 100.00');
      return;
    }
    try {
      await api.post('/api/admin/jackpot', { jackpot_cents: cents });
      setJackpot(cents);
      setOk('Jackpot saved');
    } catch (e) {
      setErr(prettyErr(e, 'Jackpot save failed'));
    }
  }

  return (
    <div className="admin-wrap">
      <section className="card admin-card">
        <h1>ADMIN</h1>
        <p>Set ticket prices, toggle availability, and manage the jackpot.</p>
        {!!err && <div className="error">{err}</div>}
        {!!ok && <div className="ok">{ok}</div>}
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          <button className="btn back-btn" onClick={() => nav('/dashboard')}>Back to Dashboard</button>
          <button className="btn ghost" onClick={runDiagnostics}>Run diagnostics</button>
        </div>
        {diag && (
          <pre style={{
            marginTop:12, background:'rgba(0,0,0,0.15)', padding:12, borderRadius:12,
            overflow:'auto', maxHeight:200
          }}>{diag}</pre>
        )}
      </section>

      {loading && <div className="card"><p>Loading…</p></div>}

      {!loading && products.map((prod) => (
        <section key={prod.game_key} className="card product-card">
          <h2>
            {prod.game_key === 'crack' ? 'Crack the Safe'
              : prod.game_key === 'box' ? 'What’s in the Box'
              : prod.game_key}
          </h2>

          <label>Product name</label>
          <input
            value={prod.name}
            onChange={(e) =>
              setProducts((old) =>
                old.map((p) =>
                  p.game_key === prod.game_key ? { ...p, name: e.target.value } : p
                )
              )
            }
          />

          <label>Ticket price (£)</label>
          <input
            type="text"
            inputMode="decimal"
            value={prod._price ?? toPounds(prod.price_cents)}
            onChange={(e) =>
              setProducts((old) =>
                old.map((p) =>
                  p.game_key === prod.game_key ? { ...p, _price: e.target.value } : p
                )
              )
            }
            onBlur={(e) => {
              const cents = parseGBP(e.target.value);
              setProducts((old) =>
                old.map((p) =>
                  p.game_key === prod.game_key
                    ? { ...p, _price: toPounds(Number.isFinite(cents) ? cents : prod.price_cents) }
                    : p
                )
              );
            }}
          />

          <label>Active</label>
          <select
            value={prod.active ? 'Yes' : 'No'}
            onChange={(e) =>
              setProducts((old) =>
                old.map((p) =>
                  p.game_key === prod.game_key
                    ? { ...p, active: e.target.value === 'Yes' }
                    : p
                )
              )
            }
          >
            <option>Yes</option>
            <option>No</option>
          </select>

          <button className="btn save-btn" onClick={() => saveProduct(prod)}>Save</button>
        </section>
      ))}

      <section className="card jackpot-card">
        <h2>Jackpot</h2>
        <label>Jackpot (£)</label>
        <input
          type="text"
          inputMode="decimal"
          value={toPounds(jackpot)}
          onChange={(e) => {
            const cents = parseGBP(e.target.value);
            if (Number.isFinite(cents)) setJackpot(cents);
          }}
        />
        <button className="btn save-btn" onClick={saveJackpot}>Save Jackpot</button>
      </section>
    </div>
  );
}