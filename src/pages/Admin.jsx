import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './admin.css';

// helpers
const toPounds = (cents) =>
  (Number.isFinite(cents) ? (cents / 100).toFixed(2) : '0.00');

// parse a GBP string -> integer cents (returns null if invalid)
function parseGBP(str) {
  if (str == null) return null;
  const clean = String(str).replace(/[^0-9.]/g, '');
  if (clean === '') return null;
  const n = Number(clean);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export default function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]); // each item may have _price (string) for editing
  const [jackpot, setJackpot] = useState(0);    // cents
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  // Load admin data
  useEffect(() => {
    (async () => {
      setErr(''); setOk('');
      try {
        setLoading(true);
        const p = await api.get('/api/admin/products');
        if (p?.products) {
          setProducts(
            p.products.map(x => ({ ...x, _price: toPounds(x.price_cents) }))
          );
        }
      } catch (e) {
        setErr(formatErr(e, 'Load products failed'));
      } finally {
        setLoading(false);
      }
    })();
    (async () => {
      try {
        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch (e) {
        setErr(prev => prev ? prev : formatErr(e, 'Load jackpot failed'));
      }
    })();
  }, []);

  function formatErr(e, fallback) {
    const msg = [
      e?.status && `status ${e.status}`,
      e?.body && JSON.stringify(e.body),
      e?.message,
    ].filter(Boolean).join(' – ');
    return msg || fallback || 'Error';
  }

  async function saveProduct(prod) {
    setErr(''); setOk('');
    // prefer edited string _price; fallback to current cents
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
      // reflect confirmed value
      setProducts(curr =>
        curr.map(p => p.game_key === prod.game_key
          ? { ...p, price_cents: cents, _price: toPounds(cents) }
          : p
        )
      );
    } catch (e) {
      setErr(formatErr(e, 'Save failed'));
    }
  }

  async function saveJackpot() {
    setErr(''); setOk('');
    const cents = parseGBP((jackpot / 100).toFixed(2));
    if (!Number.isFinite(cents)) {
      setErr('Enter a valid jackpot amount, e.g. 100.00');
      return;
    }
    try {
      await api.post('/api/admin/jackpot', { jackpot_cents: cents });
      setJackpot(cents);
      setOk('Jackpot saved');
    } catch (e) {
      setErr(formatErr(e, 'Jackpot save failed'));
    }
  }

  return (
    <div className="admin-wrap">
      <section className="card admin-card">
        <h1>ADMIN</h1>
        <p>Set ticket prices, toggle availability, and manage the jackpot.</p>
        {!!err && <div className="error">{err}</div>}
        {!!ok && <div className="ok">{ok}</div>}
        <button onClick={() => navigate('/dashboard')} className="btn back-btn">
          Back to Dashboard
        </button>
      </section>

      {loading && <div>Loading…</div>}

      {!loading && products.map((prod) => (
        <section key={prod.game_key} className="card product-card">
          <h2>{prod.game_key === 'crack'
                ? 'Crack the Safe'
                : prod.game_key === 'box'
                ? 'What’s in the Box'
                : prod.game_key}</h2>

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

          <button className="btn save-btn" onClick={() => saveProduct(prod)}>
            Save
          </button>
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
            setJackpot(Number.isFinite(cents) ? cents : jackpot);
          }}
        />
        <button className="btn save-btn" onClick={saveJackpot}>Save Jackpot</button>
      </section>
    </div>
  );
}