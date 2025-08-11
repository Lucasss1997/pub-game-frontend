import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await api.get('/api/dashboard');
        if (alive) setData(d);
      } catch (e) {
        if (alive) setErr(e.message || 'Failed to load dashboard');
      }
    })();
    return () => { alive = false; };
  }, []);

  if (err) return <div style={{ padding:16, color:'crimson' }}>{err}</div>;
  if (!data) return <div style={{ padding:16 }}>Loading…</div>;

  const pubs = data.pubs || [];
  return (
    <div style={{ padding:16, fontFamily:'system-ui, sans-serif' }}>
      <h1>Your Pub</h1>
      {pubs.length === 0 ? (
        <p>No pub linked to this account yet.</p>
      ) : (
        pubs.map(p => (
          <div key={p.id} style={{ border:'1px solid #ddd', padding:12, marginTop:12 }}>
            <div><strong>{p.name}</strong></div>
            {p.city && <div>City: {p.city}</div>}
            {p.address && <div>Address: {p.address}</div>}
            {'active' in p && <div>Active: {String(p.active)}</div>}
            <div>ID: {p.id}</div>
          </div>
        ))
      )}
    </div>
  );
}
