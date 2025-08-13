import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE, WS_BASE } from '../lib/env';
import api from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Enter() {
  const { pubId, gameKey } = useParams();
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`${API_BASE}/game/${pubId}/${gameKey}`);
        setGameData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [pubId, gameKey]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <h1>{gameData?.name || 'Game'}</h1>
      {/* Your existing UI for Enter page */}
    </div>
  );
}