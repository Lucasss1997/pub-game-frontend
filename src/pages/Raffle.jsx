import React, { useState } from 'react';
import '../ui/pubgame-theme.css';

export default function Raffle() {
  const [entries, setEntries] = useState(['07700111222', '07700999888']);
  const [winner, setWinner] = useState('');

  const drawWinner = () => {
    if (entries.length === 0) return;
    const picked = entries[Math.floor(Math.random() * entries.length)];
    setWinner(picked);
  };

  return (
    <div className="neon-wrap">
      <h2>Raffle Draw</h2>
      <p>Entries: {entries.length}</p>
      <button className="btn" onClick={drawWinner}>Draw Winner</button>
      {winner && <p>Winner: {winner}</p>}
    </div>
  );
}