import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const fetchDashboard = useCallback(async () => {
    try {
      setErr('');
      const data = await api.get('/api/dashboard');
      setPubs(Array.isArray(data?.pubs) ? data.pubs : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const statusColor = (pub) => {
    const exp = pub?.expires_at ? new Date(pub.expires_at) : null;
    if (!exp) return pub.active ? '#22c55e' : '#f43f5e'; // fall back to active flag
    const days = (exp - new Date()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return '#ef4444';        // red: expired
    if (days < 7)  return '#f59e0b';        // orange: expiring soon
    return '#22c55e';                       // green: healthy
  };

  const expiryLabel = (pub) => {
    const exp = pub?.expires_at ? new Date(pub.expires_at) : null;
    if (!exp) return pub.active ? 'Active' : 'Inactive';
    const days = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days < 7)  return `Expiring in ${days} day(s)`;
    return `Expires on ${exp.toLocaleDateString()}`;
  };

  if (loading) return <p style={{ padding: 20 }}>Loading dashboard…</p>;
  if (err)     return <p style={{ padding: 20, color: '#b91c1c' }}>{err}</p>;
  if (!pubs.length) return <p style={{ padding: 20 }}>No pub linked to your account.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Pub</h1>

      {pubs.map((pub) => (
        <div key={pub.id} style={styles.card}>
          <div style={styles.header}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <span
                title={expiryLabel(pub)}
                style={{ ...styles.dot, background: statusColor(pub) }}
              />
              {pub.name}
            </h2>
            <div style={{ fontSize: 13, color: '#64748b' }}>{expiryLabel(pub)}</div>
          </div>

          <p><strong>City:</strong> {pub.city || '-'}</p>
          <p><strong>Address:</strong> {pub.address || '-'}</p>
          <p><strong>Status:</strong> {pub.active ? 'Active' : 'Inactive'}</p>
          {pub.expires_at && (
            <p><strong>Subscription Expires:</strong> {new Date(pub.expires_at).toLocaleDateString()}</p>
          )}
          <p><strong>ID:</strong> {pub.id}</p>

          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <button onClick={() => nav('/billing')}>Manage / Renew</button>
            <button onClick={fetchDashboard}>Refresh</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    background: '#fff'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,0.15)'
  }
};
