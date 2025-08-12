import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/games')
      .then(setGames)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="neon-wrap">
      <h2>Dashboard</h2>
      <div className="game-list">
        {games.map(g => (
          <div key={g.id} className="card">
            <h3>{g.name}</h3>
            <p>Ticket Price: £{(g.price_cents / 100).toFixed(2)}</p>
            <p>Jackpot: £{(g.jackpot_cents / 100).toFixed(2)}</p>
            <a className="btn" href={`/enter/${g.pub_id}/${g.game_key}`}>Get QR Code</a>
          </div>
        ))}
      </div>
    </div>
  );
}