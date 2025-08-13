import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE, WS_BASE } from '../lib/env';
import { api } from '../lib/api';

export default function Enter() {
  const { pubId, gameKey } = useParams();
  const [status, setStatus] = useState('');
  const [jackpot, setJackpot] = useState(null);

  useEffect(() => {
    async function fetchJackpot() {
      try {
        const res = await fetch(`${API_BASE}/api/jackpot/${pubId}/${gameKey}`);
        if (!res.ok) throw new Error('Failed to fetch jackpot');
        const data = await res.json();
        setJackpot(data.jackpot_cents / 100);
      } catch (err) {
        console.error(err);
      }
    }
    fetchJackpot();
  }, [pubId, gameKey]);

  useEffect(() => {
    const wsUrl = `${WS_BASE}/ws?pubId=${pubId}&gameKey=${gameKey}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'update') {
        setJackpot(data.jackpot_cents / 100);
      }
    };
    return () => ws.close();
  }, [pubId, gameKey]);

  const handleJoin = async () => {
    try {
      const res = await api.post(`/api/join/${pubId}/${gameKey}`);
      if (!res.ok) throw new Error('Join failed');
      setStatus('Joined successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="enter-wrap">
      <h1>Enter Game</h1>
      {jackpot !== null && <p>Current Jackpot: £{jackpot}</p>}
      <button onClick={handleJoin}>Join Game</button>
      {status && <p>{status}</p>}
    </div>
  );
}