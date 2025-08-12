import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const rowCard = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:12 };
const label = { color:'#94a3b8', fontSize:13 };
const input = { padding:'8px 10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.18)', background:'rgba(15,23,42,0.8)', color:'#fff', width:'100%' };
const btn = { padding:'8px 12px', borderRadius:10, border:0, background:'#22c55e', color:'#0f172a', fontWeight:800, cursor:'pointer' };
const btnGhost = { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.18)', background:'transparent', color:'#e5e7eb', cursor:'pointer' };
const muted = { color:'#94a3b8' };

export default function Pricing() {
  const [gameKey, setGameKey] = useState('crack_the_safe');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', price_cents: 100, sort_order: 0, active: true });
  const [editingId, setEditingId] = useState('');

  const games = useMemo(() => ([
    { key:'crack_the_safe', name:'Crack the Safe' },
    { key:'whats_in_the_box', name:'What’s in the Box' },
  ]), []);

  async function load() {
    setLoading(true); setErr('');
    try {
      const r = await api.get(`/api/raffle/my-products?gameKey=${gameKey}`);
      setProducts(r.products || []);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [gameKey]);

  function startNew() {
    setEditingId('');
    setForm({ name:'', price_cents:100, sort_order:products.length, active:true });
  }
  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name:p.name, price_cents:p.price_cents, sort_order:p.sort_order, active:p.active });
  }

  async function save(e) {
    e.preventDefault();
    setErr('');
    try {
      if (!form.name || !Number.isInteger(Number(form.price_cents))) throw new Error('Name and price required');
      if (editingId) {
        await api.put(`/api/raffle/products/${editingId}`, {
          name: form.name,
          price_cents: Number(form.price_cents),
          sort_order: Number(form.sort_order),
          active: !!form.active,
        });
      } else {
        await api.post('/api/raffle/products', {
          gameKey,
          name: form.name,
          price_cents: Number(form.price_cents),
          sort_order: Number(form.sort_order),
          active: !!form.active,
        });
      }
      await load();
      startNew();
    } catch (e2) {
      setErr(e2.message || 'Save failed');
    }
  }

  async function deactivate(id) {
    if (!window.confirm('Hide this product from players?')) return;
    await api.del(`/api/raffle/products/${id}`);
    await load();
  }

  // simple “move up/down” reorder
  async function move(id, dir) {
    const sorted = [...products].sort((a,b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = sorted.findIndex(x => x.id === id);
    const j = idx + (dir === 'up' ? -1 : 1);
    if (idx < 0 || j < 0 || j >= sorted.length) return;

    // swap
    [sorted[idx].sort_order, sorted[j].sort_order] = [sorted[j].sort_order, sorted[idx].sort_order];
    try {
      await api.post('/api/raffle/products/reorder', {
        gameKey,
        order: sorted.sort((a,b)=>a.sort_order-b.sort_order).map(x => x.id),
      });
      setProducts(sorted);
    } catch (e) {
      setErr(e.message || 'Failed to reorder');
    }
  }

  return (
    <div style={{ padding:20, maxWidth:900, margin:'0 auto', color:'#e5e7eb', fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif' }}>
      <h1 style={{ marginTop:0 }}>Tickets & Pricing</h1>

      <div style={{ display:'flex', gap:10, marginBottom:12 }}>
        <select value={gameKey} onChange={(e)=>setGameKey(e.target.value)} style={input}>
          {games.map(g => <option key={g.key} value={g.key}>{g.name}</option>)}
        </select>
        <button style={btnGhost} onClick={load}>Refresh</button>
      </div>

      {err && <div style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.35)', color:'#fecaca', padding:10, borderRadius:10, marginBottom:10 }}>{err}</div>}
      {loading && <p style={muted}>Loading…</p>}

      {/* Existing products */}
      <div style={{ display:'grid', gap:10, marginBottom:16 }}>
        {[...products].sort((a,b)=> (a.sort_order??0)-(b.sort_order??0)).map(p => (
          <div key={p.id} style={rowCard}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
              <div>
                <div><b>{p.name}</b> — £{(p.price_cents/100).toFixed(2)} {p.active ? '' : <span style={{ color:'#fca5a5' }}>(inactive)</span>}</div>
                <div style={muted}>Order {p.sort_order} • {p.game_key}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={btnGhost} onClick={()=>move(p.id,'up')}>↑</button>
                <button style={btnGhost} onClick={()=>move(p.id,'down')}>↓</button>
                <button style={btnGhost} onClick={()=>startEdit(p)}>Edit</button>
                <button style={btnGhost} onClick={()=>deactivate(p.id)}>Deactivate</button>
              </div>
            </div>
          </div>
        ))}
        {!products.length && !loading && <div style={muted}>No products yet. Add one below.</div>}
      </div>

      {/* Editor */}
      <form onSubmit={save} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:12, display:'grid', gap:10 }}>
        <h3 style={{ margin:'0 0 4px 0' }}>{editingId ? 'Edit product' : 'Add product'}</h3>
        <label style={{ display:'grid', gap:6 }}>
          <span style={label}>Name</span>
          <input style={input} value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} placeholder="e.g. £1 Standard Entry" />
        </label>
        <label style={{ display:'grid', gap:6 }}>
          <span style={label}>Price (pence)</span>
          <input style={input} type="number" value={form.price_cents}
            onChange={(e)=>setForm(f=>({...f, price_cents:e.target.valueAsNumber || 0}))} placeholder="100 = £1.00" />
        </label>
        <label style={{ display:'grid', gap:6 }}>
          <span style={label}>Sort order</span>
          <input style={input} type="number" value={form.sort_order}
            onChange={(e)=>setForm(f=>({...f, sort_order:e.target.valueAsNumber || 0}))} />
        </label>
        <label style={{ display:'flex', alignItems:'center', gap:8 }}>
          <input type="checkbox" checked={!!form.active} onChange={(e)=>setForm(f=>({...f, active:e.target.checked}))} />
          <span style={label}>Active</span>
        </label>

        <div style={{ display:'flex', gap:8 }}>
          <button style={btn} type="submit">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && <button style={btnGhost} type="button" onClick={startNew}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}