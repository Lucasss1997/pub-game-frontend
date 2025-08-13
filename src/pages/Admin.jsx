// src/pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { getAdminConfig, saveJackpot } from '../lib/api';

export default function AdminPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jackpots, setJackpots] = useState({});

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getAdminConfig();
        setConfig(data);
        setJackpots(data.jackpots || {});
      } catch (err) {
        console.error(err);
        setError('Failed to load admin config');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  async function handleSave(gameKey) {
    try {
      await saveJackpot(gameKey, jackpots[gameKey]);
      alert('Jackpot saved!');
    } catch (err) {
      alert('Failed to save jackpot');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Admin</h1>

      {['safe', 'box'].map(gameKey => (
        <div key={gameKey} style={{ marginBottom: '20px' }}>
          <h2>
            {gameKey === 'safe' ? 'Crack the Safe' : "What's in the Box"}
          </h2>

          {config.products?.[gameKey]?.length ? (
            <select>
              {config.products[gameKey].map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} - £{(prod.price_cents / 100).toFixed(2)}
                </option>
              ))}
            </select>
          ) : (
            <p>No products configured yet for this game.</p>
          )}

          <div>
            <label>
              Jackpot (£):
              <input
                type="number"
                value={jackpots[gameKey] || 0}
                onChange={e =>
                  setJackpots({ ...jackpots, [gameKey]: Number(e.target.value) })
                }
              />
            </label>
            <button onClick={() => handleSave(gameKey)}>Save Jackpot</button>
          </div>
        </div>
      ))}
    </div>
  );
}