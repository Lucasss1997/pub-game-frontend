import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './admin.css'; // your playful orange/purple styles

// --- Money helpers (GBP) ---
function centsToPoundsStr(cents) {
  const n = Number.isFinite(cents) ? cents : 0;
  return (n / 100).toFixed(2);
}
function poundsInputToCents(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v * 100);
  let s = String(v).trim();
  s = s.replace(/[£\s,]/g, '').replace(/p$/i, '');
  if (s === '' || s === '.') return 0;
  if (!/^\d+(\.\d{0,2})?$/.test(s)) {
    const err = new Error('Enter money as 0.00');
    err.status = 400;
    throw err;
  }
  return Math.round(parseFloat(s) * 100);
}

export default function Admin() {
  const nav = useNavigate();

  // products keyed by game_key
  const [rows, setRows] = useState([
    { game_key: 'crack_the_safe', name: 'Crack the Safe Ticket', price: '0.00', active: true, id: null },
    { game_key: 'whats_in_the_box', name: 'What’s in the Box Ticket', price: '0.00', active: true, id: null },
  ]);
  const [jackpot, setJackpot] = useState('0.00');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [diag, setDiag] = useState('');

  // fetch initial data from /api/dashboard
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/api/dashboard'); // credentials included in helper
        if (!alive) return;

        // jackpot
        const jp = data?.stats?.jackpot_cents ?? 0;
        setJackpot(centsToPoundsStr(jp));

        // products -> map into our two rows (keep any others but we only render the two)
        const byKey = {};
        (data?.products || []).forEach(p => {
          byKey[p.game_key] = {
            game_key: p.game_key,
            name: p.name || '',
            price: centsToPoundsStr(p.price_cents ?? 0),
            active: !!p.active,
            id: p.id ?? null,
          };
        });

        setRows(prev => prev.map(r => byKey[r.game_key] ? { ...r, ...byKey[r.game_key] } : r));
      } catch (e) {
        setError(renderHttpError(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const canSave = useMemo(() => !busy && !loading, [busy, loading]);

  async function handleSaveJackpot() {
    setBusy(true);
    setError('');
    try {
      const body = { jackpot };
      // let the server parse; our backend also accepts strings
      await api.post('/api/admin/jackpot', body);
    } catch (e) {
      setError(renderHttpError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProduct(ix) {
    setBusy(true);
    setError('');
    try {
      const r = rows[ix];
      // server accepts price as string (e.g. "1.00"); leave it as-is
      const payload = {
        products: [{
          game_key: r.game_key,
          name: r.name || '',
          price: r.price,      // keep as string "x.xx"
          active: !!r.active,
        }],
      };
      await api.post('/api/admin/products', payload);
    } catch (e) {
      setError(renderHttpError(e));
    } finally {
      setBusy(false);
    }
  }

  async function runDiagnostics() {
    setDiag('');
    setError('');
    try {
      const me = await api.get('/api/dashboard');
      setDiag(JSON.stringify({
        user: me?.user ?? undefined,  // some backends include user; harmless if undefined
        pub: me?.pub ?? undefined,
        products: me?.products?.length ?? 0,
        jackpot_cents: me?.stats?.jackpot_cents ?? null,
      }, null, 2));
    } catch (e) {
      setDiag(renderHttpError(e));
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title">Admin</h1>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav('/dashboard')}>Back to Dashboard</button>
          <button className="btn ghost" onClick={() => nav('/pricing')}>New Game</button>
          <button className="btn ghost" onClick={() => nav('/billing')}>Billing</button>
          <button className="btn solid" onClick={async () => { try { await api.post('/api/logout', {}); nav('/login'); } catch {} }}>
            Logout
          </button>
        </div>

        {loading && <div className="diag">Loading…</div>}
        {!!error && <div className="alert error">{error}</div>}

        <div className="actions" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={runDiagnostics}>Run diagnostics</button>
        </div>
        {!!diag && <pre className="diag">{diag}</pre>}
      </div>

      {/* Jackpot */}
      <div className="admin-card">
        <h2 className="section-title">Jackpot</h2>
        <div className="field">
          <span>Jackpot (£)</span>
          <input
            inputMode="decimal"
            value={jackpot}
            onChange={e => setJackpot(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="actions">
          <button className="btn solid" disabled={!canSave} onClick={handleSaveJackpot}>
            Save jackpot
          </button>
        </div>
      </div>

      {/* Crack the Safe */}
      <div className="admin-card">
        <h2 className="section-title">Crack the Safe</h2>
        <FormRow
          row={rows[0]}
          onChange={(upd) => setRows(rs => rs.map((r, i) => i === 0 ? { ...r, ...upd } : r))}
          onSave={() => handleSaveProduct(0)}
          canSave={canSave}
        />
      </div>

      {/* What's in the Box */}
      <div className="admin-card">
        <h2 className="section-title">What’s in the Box</h2>
        <FormRow
          row={rows[1]}
          onChange={(upd) => setRows(rs => rs.map((r, i) => i === 1 ? { ...r, ...upd } : r))}
          onSave={() => handleSaveProduct(1)}
          canSave={canSave}
        />
      </div>
    </div>
  );
}

function FormRow({ row, onChange, onSave, canSave }) {
  return (
    <>
      <div className="field">
        <span>Product name</span>
        <input value={row.name} onChange={e => onChange({ name: e.target.value })} />
      </div>
      <div className="field">
        <span>Ticket price (£)</span>
        <input
          inputMode="decimal"
          value={row.price}
          onChange={e => onChange({ price: e.target.value })}
          placeholder="0.00"
        />
      </div>
      <div className="field">
        <span>Active</span>
        <select
          value={row.active ? 'yes' : 'no'}
          onChange={e => onChange({ active: e.target.value === 'yes' })}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="actions">
        <button className="btn solid" disabled={!canSave} onClick={onSave}>Save</button>
      </div>
    </>
  );
}

function renderHttpError(e) {
  // Our api helper usually throws {status, message, body}
  if (!e) return 'Unknown error';
  const status = e.status || e?.response?.status || '';
  let msg = e.message || '';
  try {
    if (e.body && typeof e.body === 'object') {
      if (e.body.error) msg = JSON.stringify(e.body);
    }
  } catch {}
  if (!msg && e.responseText) msg = e.responseText;
  if (!msg) msg = 'Server error';
  return status ? `HTTP ${status} · ${msg}` : msg;
}