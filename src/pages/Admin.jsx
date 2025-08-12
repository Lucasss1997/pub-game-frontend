import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './admin.css';

export default function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState(0);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  // Load admin data
  useEffect(() => {
    (async () => {
      setErr('');
      setOk('');
      try {
        setLoading(true);
        const p = await api.get('/api/admin/products');
        if (p?.products) setProducts(p.products);

        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch (e) {
        const msg = [
          e.status && `status ${e.status}`,
          e.body && JSON.stringify(e.body),
          e.message,
        ]
          .filter(Boolean)
          .join(' – ');
        setErr(msg || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateProduct = async (id, changes) => {
    try {
      setErr('');
      setOk('');
      await api.post('/api/admin/products', { id, ...changes });
      setOk('Saved');
    } catch (e) {
      const msg = [
        e.status && `status ${e.status}`,
        e.body && JSON.stringify(e.body),
        e.message,
      ]
        .filter(Boolean)
        .join(' – ');
      setErr(msg || 'Save failed');
    }
  };

  const updateJackpot = async () => {
    try {
      setErr('');
      setOk('');
      await api.post('/api/admin/jackpot', { jackpot_cents: jackpot });
      setOk('Jackpot saved');
    } catch (e) {
      const msg = [
        e.status && `status ${e.status}`,
        e.body && JSON.stringify(e.body),
        e.message,
      ]
        .filter(Boolean)
        .join(' – ');
      setErr(msg || 'Jackpot save failed');
    }
  };

  return (
    <div className="admin-wrap">
      <section className="card admin-card">
        <h1>ADMIN</h1>
        <p>Set ticket prices, toggle availability, and manage the jackpot.</p>
        {err && <div className="error">{err}</div>}
        {ok && <div className="ok">{ok}</div>}
        <button onClick={() => navigate('/dashboard')} className="btn back-btn">
          Back to Dashboard
        </button>
      </section>

      {loading && <div>Loading...</div>}

      {!loading && (
        <>
          {products.map((prod) => (
            <section key={prod.id} className="card product-card">
              <h2>{prod.game_key === 'crack' ? 'Crack the Safe' : prod.game_key}</h2>
              <label>Product name</label>
              <input
                value={prod.name}
                onChange={(e) =>
                  setProducts((old) =>
                    old.map((p) =>
                      p.id === prod.id ? { ...p, name: e.target.value } : p
                    )
                  )
                }
              />
              <label>Ticket price (£)</label>
              <input
                type="number"
                value={(prod.price_cents / 100).toFixed(2)}
                onChange={(e) =>
                  setProducts((old) =>
                    old.map((p) =>
                      p.id === prod.id
                        ? { ...p, price_cents: Math.round(parseFloat(e.target.value) * 100) }
                        : p
                    )
                  )
                }
              />
              <label>Active</label>
              <select
                value={prod.active ? 'Yes' : 'No'}
                onChange={(e) =>
                  setProducts((old) =>
                    old.map((p) =>
                      p.id === prod.id
                        ? { ...p, active: e.target.value === 'Yes' }
                        : p
                    )
                  )
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
              <button
                className="btn save-btn"
                onClick={() => updateProduct(prod.id, prod)}
              >
                Save
              </button>
            </section>
          ))}

          <section className="card jackpot-card">
            <h2>Jackpot</h2>
            <label>Jackpot (£)</label>
            <input
              type="number"
              value={(jackpot / 100).toFixed(2)}
              onChange={(e) =>
                setJackpot(Math.round(parseFloat(e.target.value) * 100))
              }
            />
            <button className="btn save-btn" onClick={updateJackpot}>
              Save Jackpot
            </button>
          </section>
        </>
      )}
    </div>
  );
}