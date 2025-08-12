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
        const list = d?.products || [];
        setProducts(list);
        if (list[0]) setProductId(list[0].id);
      } catch (e) { setErr(e.message || 'Failed to load products'); }
    })();
  }, [pubId, gameKey]);

  async function onPay(e){
    e.preventDefault();
    setErr('');
    if (!productId || !phone) { setErr('Select a price and enter your mobile.'); return; }
    try{
      setLoading(true);
      const d = await api.post('/api/raffle/checkout', { pubId, gameKey, productId, phone });
      if (!d?.checkoutUrl) throw new Error('No checkout URL');
      setPayUrl(d.checkoutUrl);
      window.location.href = d.checkoutUrl;
    }catch(e2){ setErr(e2.message || 'Unable to start checkout'); }
    finally{ setLoading(false); }
  }

  return (
    <div style={s.app}>
      <main style={s.main}>
        <div style={s.card}>
          <h1 style={{marginTop:0}}>Enter – {titleFor(gameKey)}</h1>
          {err && <div style={s.bad}>{err}</div>}

          <form onSubmit={onPay} style={{display:'grid', gap:12}}>
            <div style={{display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
              {products.map(p => (
                <label key={p.id} style={s.priceCard}>
                  <input type="radio" name="price" value={p.id}
                         checked={productId===p.id} onChange={()=>setProductId(p.id)} />
                  <div style={{fontSize:22, fontWeight:800}}>£{(p.price_cents/100).toFixed(2)}</div>
                  <div style={{color:'#94a3b8', fontSize:12}}>{p.name}</div>
                </label>
              ))}
            </div>

            <label style={s.field}>
              <span style={s.label}>Mobile number (UK)</span>
              <input style={s.input} type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                     placeholder="+447123456789" required />
            </label>

            <button style={s.btn} disabled={loading || !productId}>
              {loading ? 'Redirecting…' : 'Pay & Enter'}
            </button>
          </form>

          {payUrl && (
            <p style={{color:'#94a3b8', marginTop:8}}>
              Not redirected? <a href={payUrl} style={{color:'#22c55e'}}>Tap here</a>.
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

const s = {
  app:{ minHeight:'100vh', background:'#0f172a', color:'#e5e7eb' },
  main:{ maxWidth:760, margin:'0 auto', padding:20 },
  card:{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16, display:'grid', gap:12 },
  field:{ display:'grid', gap:6 },
  label:{ fontSize:12, color:'#94a3b8' },
  input:{ padding:'10px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,23,42,0.7)', color:'#e5e7eb' },
  btn:{ padding:'10px 14px', borderRadius:12, border:'none', background:'#22c55e', color:'#0b1220', fontWeight:800, cursor:'pointer' },
  bad:{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', color:'#fecaca', padding:8, borderRadius:10 },
  priceCard:{ display:'grid', gap:4, alignContent:'start', padding:12, borderRadius:12, border:'1px solid rgba(255,255,255,0.12)' }
};