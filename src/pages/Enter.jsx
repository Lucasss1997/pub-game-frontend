import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function Enter() {
  const { pubId, gameKey } = useParams();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [payUrl, setPayUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get(`/api/raffle/products?pubId=${pubId}&gameKey=${gameKey}`);
        setProducts(d?.products || []);
        if (d?.products?.[0]) setProductId(d.products[0].id);
      } catch (e) {
        setErr(e.message || 'Failed to load products');
      }
    })();
  }, [pubId, gameKey]);

  async function onPay(e) {
    e.preventDefault();
    setErr('');
    if (!productId || !phone) {
      setErr('Please select a price and enter your mobile number.');
      return;
    }
    try {
      setLoading(true);
      const d = await api.post('/api/raffle/checkout', { pubId, gameKey, productId, phone });
      if (!d?.checkoutUrl) throw new Error('No checkout URL');
      setPayUrl(d.checkoutUrl);
      window.location.href = d.checkoutUrl; // go to Stripe
    } catch (e) {
      setErr(e.message || 'Unable to start checkout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={shell}>
      <main style={main}>
        <div style={card}>
          <h1 style={{marginTop:0}}>Enter – {titleFor(gameKey)}</h1>
          {err && <div style={bad}>{err}</div>}

          <form onSubmit={onPay} style={{display:'grid', gap:10}}>
            <label style={field}>
              <span style={label}>Entry price</span>
              <select value={productId} onChange={e=>setProductId(e.target.value)} style={input}>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — £{(p.price_cents/100).toFixed(2)}</option>
                ))}
              </select>
            </label>

            <label style={field}>
              <span style={label}>Mobile number (UK)</span>
              <input style={input} type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                     placeholder="+447123456789" required />
            </label>

            <button style={button} disabled={loading || !productId}>
              {loading ? 'Redirecting…' : 'Pay & Enter'}
            </button>
          </form>

          {payUrl && (
            <p style={{color:'#94a3b8', marginTop:8}}>
              If you weren’t redirected, <a href={payUrl} style={{color:'#22c55e'}}>tap here</a>.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function titleFor(key){
  if (key === 'crack_the_safe') return 'Crack the Safe';
  if (key === 'whats_in_the_box') return 'What’s in the Box';
  return key;
}

const shell = { minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' };
const main  = { maxWidth:520, margin:'0 auto', padding:20 };
const card  = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 };
const field = { display:'grid', gap:6 };
const label = { fontSize:12, color:'#94a3b8' };
const input = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' };
const button= { padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' };
const bad   = { background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 };