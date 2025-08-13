import React, { useState } from 'react';
import { API_BASE } from '../lib/env';
import api from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Staff() {
  const [pubId, setPubId] = useState('');
  const [gameKey, setGameKey] = useState('');

  async function handleAssign(e) {
    e.preventDefault();
    try {
      await api.post(`${API_BASE}/staff/assign`, { pubId, gameKey });
      alert('Assigned successfully');
    } catch (err) {
      console.error(err);
      alert('Error assigning');
    }
  }

  return (
    <div className="page">
      <h1>Staff</h1>
      <form onSubmit={handleAssign}>
        <input
          type="text"
          placeholder="Pub ID"
          value={pubId}
          onChange={(e) => setPubId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Game Key"
          value={gameKey}
          onChange={(e) => setGameKey(e.target.value)}
        />
        <button type="submit">Assign</button>
      </form>
    </div>
  );
}