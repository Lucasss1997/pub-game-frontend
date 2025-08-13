import React, { useState } from 'react';
import { API_BASE } from '../lib/env';
import { api } from '../lib/api';

export default function Staff() {
  const [pubId, setPubId] = useState('');
  const [gameKey, setGameKey] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('');

  const handleManualEntry = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/manual-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubId, gameKey, playerName })
      });
      if (!res.ok) throw new Error('Failed to add player');
      setStatus('Player added successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="staff-wrap">
      <h1>Staff Manual Entry</h1>
      <input
        placeholder="Pub ID"
        value={pubId}
        onChange={(e) => setPubId(e.target.value)}
      />
      <input
        placeholder="Game Key"
        value={gameKey}
        onChange={(e) => setGameKey(e.target.value)}
      />
      <input
        placeholder="Player Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleManualEntry}>Add Player</button>
      {status && <p>{status}</p>}
    </div>
  );
}