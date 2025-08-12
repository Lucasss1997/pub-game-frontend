// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Admin (Pricing) screen
 * - GET  /api/admin/products               -> [{ id, game_key, name, price_cents, active }]
 * - POST /api/admin/products               -> { ok: true }
 * - GET  /api/admin/jackpot                -> { jackpot_cents }
 * - POST /api/admin/jackpot                -> { ok: true }
 * - GET  /api/admin/debug                  -> misc debug (optional)
 *
 * All endpoints require Authorization: Bearer <token>.
 */

const API_BASE =
  (process.env.REACT_APP_API_BASE || '').replace(/\/+$/, '');

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// nice helpers
const poundsToCents = (v) => Math.round(Number(v || 0) * 100);
const centsToPounds = (c) => (Number(c || 0) / 100).toFixed(2);

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [diag, setDiag] = useState(null);

  // products by key we care about
  const [products, setProducts] = useState({
    crack_safe: { id: null, game_key: 'crack_safe', name: 'Crack the Safe Ticket', price: '2.00', active: true },
    whats_in_the_box: { id: null, game_key: 'whats_in_the_box', name: 'What’s in the Box Ticket', price: '2.00', active: true },
  });

  const [jackpot, setJackpot] = useState('0.00');
  const [saving, setSaving] = useState({ p1: false, p2: false, jp: false });

  const rows = useMemo(() => ([
    { key: 'crack_safe', title: 'Crack the Safe' },
    { key: 'whats_in_the_box', title: 'What’s in the Box' },
  ]), []);

  useEffect(() => {
    let didCancel = false;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        // Load products
        const prod = await apiGet('/api/admin/products');
        // Normalize into our two known keys (if others exist, ignore for now)
        const next = { ...products };
        (prod || []).forEach((p) => {
          if (p.game_key === 'crack_safe' || p.game_key === 'whats_in_the_box') {
            next[p.game_key] = {
              id: p.id ?? null,
              game_key: p.game_key,
              name: p.name || next[p.game_key].name,
              price: centsToPounds(p.price_cents),
              active: !!p.active,
            };
          }
        });
        if (!didCancel) setProducts(next);

        // Load jackpot
        const jp = await apiGet('/api/admin/jackpot');
        if (!didCancel) setJackpot(centsToPounds(jp?.jackpot_cents ?? 0));

        // Optional debug
        try {
          const d = await apiGet('/api/admin/debug');
          if (!didCancel) setDiag(d);
        } catch {
          // ignore if 404 is disabled on server
        }
      } catch (e) {
        if (!didCancel) setErr(e.message || 'Load failed');
      } finally {
        if (!didCancel) setLoading(false);
      }
    })();
    return () => { didCancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProduct = async (game_key, btnKey) => {
    setSaving((s) => ({ ...s, [btnKey]: true }));
    setErr('');
    try {
      const p = products[game_key];
      await apiPost('/api/admin/products', {
        game_key: p.game_key,
        name: p.name,
        price_cents: poundsToCents(p.price),
        active: !!p.active,
      });
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving((s) => ({ ...s, [btnKey]: false }));
    }
  };

  const saveJackpot = async () => {
    setSaving((s) => ({ ...s, jp: true }));
    setErr('');
    try {
      await apiPost('/api/admin/jackpot', { jackpot_cents: poundsToCents(jackpot) });
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving((s) => ({ ...s, jp: false }));
    }
  };

  const s = styles;

  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <section style={s.panel}>
          <h1 style={s.h1}>ADMIN</h1>
          <p style={s.sub}>Set ticket prices, toggle availability, and manage the jackpot.</p>
          {err && <div style={s.alert}>{err}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <Link to="/dashboard" style={s.btnGhost}>BACK TO DASHBOARD</Link>
            <button
              type="button"
              style={s.btn}
              onClick={async () => {
                try {
                  const d = await apiGet('/api/admin/debug');
                  setDiag(d);
                } catch (e) {
                  setDiag({ error: e.message || 'Debug failed' });
                }
              }}
            >
              RUN DIAGNOSTICS
            </button>
          </div>

          {diag && (
            <pre style={s.diag}>
{JSON.stringify(diag, null, 2)}
            </pre>
          )}
        </section>

        {/* PRODUCTS */}
        {rows.map((row, idx) => {
          const p = products[row.key];
          const btnKey = idx === 0 ? 'p1' : 'p2';
          return (
            <section key={row.key} style={s.card}>
              <h2 style={s.h2}>{row.title}</h2>

              <label style={s.field}>
                <span style={s.label}>Product name</span>
                <input
                  style={s.input}
                  value={p.name}
                  onChange={(e) =>
                    setProducts((prev) => ({
                      ...prev,
                      [row.key]: { ...prev[row.key], name: e.target.value },
                    }))
                  }
                />
              </label>

              <label style={s.field}>
                <span style={s.label}>Ticket price (£)</span>
                <input
                  style={s.input}
                  inputMode="decimal"
                  value={p.price}
                  onChange={(e) =>
                    setProducts((prev) => ({
                      ...prev,
                      [row.key]: { ...prev[row.key], price: e.target.value },
                    }))
                  }
                />
              </label>

              <label style={s.field}>
                <span style={s.label}>Active</span>
                <select
                  style={s.select}
                  value={p.active ? 'yes' : 'no'}
                  onChange={(e) =>
                    setProducts((prev) => ({
                      ...prev,
                      [row.key]: { ...prev[row.key], active: e.target.value === 'yes' },
                    }))
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <button
                type="button"
                style={s.btnPrimary}
                disabled={saving[btnKey]}
                onClick={() => saveProduct(row.key, btnKey)}
              >
                {saving[btnKey] ? 'SAVING…' : 'SAVE'}
              </button>
            </section>
          );
        })}

        {/* JACKPOT */}
        <section style={s.card}>
          <h2 style={s.h2}>Jackpot</h2>
          <label style={s.field}>
            <span style={s.label}>Jackpot (£)</span>
            <input
              style={s.input}
              inputMode="decimal"
              value={jackpot}
              onChange={(e) => setJackpot(e.target.value)}
            />
          </label>
          <button
            type="button"
            style={s.btnPrimary}
            disabled={saving.jp}
            onClick={saveJackpot}
          >
            {saving.jp ? 'SAVING…' : 'SAVE JACKPOT'}
          </button>
        </section>

        {loading && <div style={s.loading}>Loading…</div>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    background: '#f59e0b',
    padding: 16,
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'grid',
    gap: 14,
  },
  panel: {
    background: '#fb923c',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15) inset, 0 10px 18px rgba(0,0,0,0.1)',
  },
  h1: { margin: 0, fontSize: 32, fontWeight: 900, color: '#3b0764' },
  h2: { margin: '2px 0 8px', fontSize: 22, fontWeight: 900, color: '#3b0764' },
  sub: { margin: '6px 0 12px', color: '#4c1d95', fontWeight: 600 },

  card: {
    background: '#fb923c',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15) inset, 0 10px 18px rgba(0,0,0,0.1)',
  },

  field: { display: 'grid', gap: 6, marginBottom: 10 },
  label: { color: '#3b0764', fontWeight: 800 },
  input: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '2px solid #fcd34d',
    background: '#fde68a',
    outline: 'none',
    fontWeight: 700,
  },
  select: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '2px solid #fcd34d',
    background: '#fde68a',
    outline: 'none',
    fontWeight: 700,
    width: 160,
  },

  btnPrimary: {
    marginTop: 6,
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#581c87',
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
  },
  btn: {
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#7c3aed',
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '10px 14px',
    borderRadius: 12,
    border: '2px solid #3b0764',
    color: '#3b0764',
    fontWeight: 900,
    textDecoration: 'none',
  },

  alert: {
    background: '#fecdd3',
    border: '2px solid #fb7185',
    color: '#7f1d1d',
    padding: 10,
    borderRadius: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  diag: {
    marginTop: 12,
    background: '#f59e0b',
    color: '#3b0764',
    borderRadius: 12,
    padding: 12,
    overflow: 'auto',
    maxHeight: 240,
    fontSize: 12,
  },
  loading: {
    textAlign: 'center',
    color: '#3b0764',
    fontWeight: 800,
    padding: 8,
  },
};