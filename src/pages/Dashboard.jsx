import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [pubs, setPubs] = useState([]);
  const nav = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const data = await api.get('/api/dashboard');
      setPubs(data.pubs || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusDotColor = (expiresAt) => {
    if (!expiresAt) return 'red';
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    if (diffDays <= 0) return 'red';
    if (diffDays < 7) return 'orange';
    return 'green';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      {pubs.length === 0 && <p>No pub data found.</p>}
      {pubs.map((pub) => (
        <div key={pub.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: getStatusDotColor(pub.expires_at)
              }}
            ></span>
            {pub.name}
          </h2>
          <p>City: {pub.city}</p>
          <p>Address: {pub.address}</p>
          <p>Active: {pub.active ? 'Yes' : 'No'}</p>
          {pub.expires_at && <p>Subscription Expires: {new Date(pub.expires_at).toLocaleDateString()}</p>}
          <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
            <button onClick={() => nav('/billing')}>Manage / Renew</button>
            <button onClick={fetchData}>Refresh</button>
          </div>
        </div>
      ))}
    </div>
  );
}
