import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function Enter() {
  const { pubId, gameKey } = useParams();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/api/raffle/products?pubId=${pubId}&gameKey=${gameKey}`);
        setProducts(r.products || []);
        if (r.products?.[0]) setProductId(r.products[0].id);
      } catch (e) {
        setErr(e.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, [pubId, gameKey]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!productId) return setErr('Select an entry price.');
    if (!/^\+?\d{8,15}$/.test(mobile)) return setErr('Enter a valid mobile (e.g. +447123456789).');

    try {
      setInfo('Contacting Stripe…');
      const { checkoutUrl } = await api.post('/api/raffle/enter', {
        pubId: Number(pubId),
        gameKey,
        productId,
        mobile,
      });
      window.location.href = checkoutUrl;
    } catch (e2) {
      setErr(e2.message || 'Could not start payment');
      setInfo('');
    }
  };

  if (loading) return <div style={wrap}><p>Loading…</p></div>;

  return (
    <div style={wrap}>
      <main style={main}>
        <h1 style={{marginTop:0, marginBottom:8}}>Enter to Play</h1>
        <p style={muted}>{gameKey.replaceAll('_',' ')}</p>

        {err && <div style={alert}>{err}</div>}
        {info && <div style={infoBox}>{info}</div>}

        <form onSubmit={submit} style={card}>
          <label style={field}>
            <span style={label}>Choose entry</span>
            <select style={input} value={productId} onChange={(e)=>setProductId(e.target.value)}>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — £{(p.price_cents/100).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span style={label}>Mobile (E.164)</span>
            <input
              style={input}
              placeholder="+447123456789"
              value={mobile}
              onChange={(e)=>setMobile(e.target.value)}
            />
          </label>

          <button style={btn} type="submit">Pay & Enter</button>
        </form>

        <p style={fine}>By entering you agree to the game rules & T&Cs.</p>
      </main>
    </div>
  );
}

const wrap = { minHeight:'100vh', background:'#0f172a', color:'#e5e7eb', fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif', display:'grid', placeItems:'center' };
const main = { padding:20, width:'min(520px,92vw)' };
const card = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:16, display:'grid', gap:12 };
const field = { display:'grid', gap:6 };
const label = { color:'#94a3b8', fontSize:13 };
const input = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.18)', background:'rgba(15,23,42,0.8)', color:'#fff' };
const btn = { padding:'10px 14px', borderRadius:12, border:0, background:'#22c55e', color:'#0f172a', fontWeight:800, cursor:'pointer' };
const muted = { color:'#94a3b8' };
const fine = { color:'#64748b', fontSize:12, marginTop:10 };
const alert = { background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.35)', color:'#fecaca', padding:10, borderRadius:10, marginBottom:10 };
const infoBox = { background:'rgba(59,130,246,.12)', border:'1px solid rgba(59,130,246,.35)', color:'#bfdbfe', padding:10, borderRadius:10, marginBottom:10 };