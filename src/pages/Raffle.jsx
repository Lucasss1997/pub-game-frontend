import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const input = { padding:'8px 10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.18)', background:'rgba(15,23,42,0.8)', color:'#fff' };
const btn = { padding:'10px 14px', borderRadius:10, border:0, background:'#22c55e', color:'#0f172a', fontWeight:800, cursor:'pointer' };
const box = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:12 };

export default function Raffle() {
  const [pubId, setPubId] = useState('1'); // or prefill from /api/dashboard
  const [gameKey, setGameKey] = useState('crack_the_safe');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [winner, setWinner] = useState(null);
  const [consuming, setConsuming] = useState(false);

  const games = useMemo(() => ([
    { key:'crack_the_safe', name:'Crack the Safe' },
    { key:'whats_in_the_box', name:'What’s in the Box' },
  ]), []);

  async function loadPaid() {
    setLoading(true); setErr('');
    try {
      const r = await api.get(`/api/raffle/entries?pubId=${pubId}&gameKey=${gameKey}`);
      setEntries(r.entries || []);
    } catch (e) {
      setErr(e.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadPaid(); /* eslint-disable-next-line */ }, [pubId, gameKey]);

  async function draw() {
    setErr(''); setWinner(null);
    try {
      const r = await api.post('/api/raffle/draw', { pubId: Number(pubId), gameKey });
      setWinner(r.winner || null);
      await loadPaid();
    } catch (e) {
      setErr(e.message || 'Failed to draw');
    }
  }

  async function consume() {
    if (!winner?.entryId) return;
    setConsuming(true);
    try {
      await api.post('/api/raffle/consume', { entryId: winner.entryId });
      setWinner(null);
      await loadPaid();
    } catch (e) {
      setErr(e.message || 'Failed to mark used');
    } finally {
      setConsuming(false);
    }
  }

  return (
    <div style={{ padding:20, maxWidth:900, margin:'0 auto', color:'#e5e7eb', fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif' }}>
      <h1 style={{marginTop:0}}>Raffle Draw</h1>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
        <label>Pub ID</label>
        <input style={input} value={pubId} onChange={(e)=>setPubId(e.target.value)} />
        <select style={input} value={gameKey} onChange={(e)=>setGameKey(e.target.value)}>
          {games.map(g=> <option key={g.key} value={g.key}>{g.name}</option>)}
        </select>
        <button style={btn} onClick={loadPaid}>Refresh</button>
      </div>

      {err && <div style={{ ...box, borderColor:'rgba(239,68,68,.35)', color:'#fecaca' }}>{err}</div>}

      <div style={{ ...box, marginBottom:12 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button style={btn} onClick={draw} disabled={loading || entries.length===0}>Draw winner</button>
          <span>{loading ? 'Loading…' : `${entries.length} paid entries`}</span>
        </div>
      </div>

      {winner && (
        <div style={{ ...box, background:'rgba(34,197,94,0.12)', borderColor:'rgba(34,197,94,0.35)', color:'#bbf7d0', marginBottom:12 }}>
          <h3 style={{ margin:'0 0 6px 0' }}>Winner</h3>
          <div>Mobile: {winner.mobileMasked}</div>
          <div style={{ marginTop:8 }}>
            <button style={btn} onClick={consume} disabled={consuming}>{consuming ? 'Marking…' : 'Mark as used (player starting)'}</button>
          </div>
        </div>
      )}

      <div style={box}>
        <h3 style={{ margin:'0 0 6px 0' }}>Paid entries</h3>
        <div style={{ display:'grid', gap:8 }}>
          {entries.map(e => (
            <div key={e.id} style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center' }}>
              <div>📱 {e.mobile_masked}</div>
              <div>£{(e.amount_pennies/100).toFixed(2)}</div>
            </div>
          ))}
          {!entries.length && <div style={{ color:'#94a3b8' }}>No paid entries yet.</div>}
        </div>
      </div>
    </div>
  );
}