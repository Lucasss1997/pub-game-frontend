import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function Enter(){
  const { pubId, gameKey } = useParams();
  const [products,setProducts] = useState([]);
  const [productId,setProductId] = useState('');
  const [mobile,setMobile] = useState('');
  const [payUrl,setPayUrl] = useState('');
  const [err,setErr] = useState('');
  const [busy,setBusy] = useState(false);

  useEffect(()=>{ (async()=>{
    try{
      const d = await api.get(`/api/raffle/products?pubId=${pubId}&gameKey=${gameKey}`);
      const list = d?.products||[];
      setProducts(list); if(list[0]) setProductId(list[0].id);
    }catch(e){ setErr(e.message||'Load failed'); }
  })(); },[pubId,gameKey]);

  async function startPay(e){
    e.preventDefault(); setErr('');
    if(!productId || !mobile) return setErr('Select a price and enter your mobile.');
    try{
      setBusy(true);
      const d = await api.post('/api/raffle/enter',{ pubId:Number(pubId), gameKey, productId, mobile });
      if(!d?.checkoutUrl) throw new Error('No checkout URL');
      setPayUrl(d.checkoutUrl); window.location.href = d.checkoutUrl;
    }catch(ex){ setErr(ex.message||'Unable to start checkout'); }
    finally{ setBusy(false); }
  }

  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:760}}>
        <GlassCard tone="newgame" title="ENTER" subtitle={gameKey.replaceAll('_',' ')}>
          {err && <div className="bad">{err}</div>}
          <form onSubmit={startPay} style={{display:'grid',gap:12}}>
            <div style={{display:'grid',gap:10,gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
              {products.map(p=>(
                <label key={p.id} className="card" style={{background:'rgba(255,255,255,.18)'}}>
                  <input type="radio" name="price" value={p.id}
                         checked={productId===p.id} onChange={()=>setProductId(p.id)}/>
                  <div style={{fontSize:22,fontWeight:800}}>£{(p.price_cents/100).toFixed(2)}</div>
                  <small>{p.name}</small>
                </label>
              ))}
            </div>
            <label className="field">
              <span>Mobile number (UK)</span>
              <input className="input" type="tel" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+447123456789" required/>
            </label>
            <NeonButton disabled={busy || !productId}>{busy?'Redirecting…':'Pay & Enter'}</NeonButton>
            {payUrl && <small>Not redirected? <a href={payUrl} style={{color:'#0b1220'}}>Tap here</a>.</small>}
          </form>
        </GlassCard>
      </div>
    </div>
  );
}