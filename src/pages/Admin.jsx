import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Admin() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/games')
      .then(setGames)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateGame = (id, field, value) => {
    setGames(prev =>
      prev.map(g => g.id === id ? { ...g, [field]: value } : g)
    );
  };

  const saveGame = async (game) => {
    try {
      await api('/api/game/update', {
        method: 'POST',
        body: JSON.stringify({
          game_id: game.id,
          price_cents: Math.round(parseFloat(game.price_cents) * 100),
          jackpot_cents: Math.round(parseFloat(game.jackpot_cents) * 100)
        })
      });
      alert('Saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving game.');
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="neon-wrap">
      <h2>Admin Panel</h2>
      <p>Set ticket prices and jackpot amounts for each game.</p>
      {games.map(game => (
        <div key={game.id} className="card" style={{ marginBottom: 20 }}>
          <h3>{game.name}</h3>
          <label>
            Ticket Price (£):
            <input
              type="number"
              step="0.01"
              value={(game.price_cents / 100).toFixed(2)}
              onChange={(e) => updateGame(game.id, 'price_cents', e.target.value)}
            />
          </label>
          <label>
            Jackpot (£):
            <input
              type="number"
              step="0.01"
              value={(game.jackpot_cents / 100).toFixed(2)}
              onChange={(e) => updateGame(game.id, 'jackpot_cents', e.target.value)}
            />
          </label>
          <button className="btn" onClick={() => saveGame(game)}>Save</button>
        </div>
      ))}
    </div>
  );
}