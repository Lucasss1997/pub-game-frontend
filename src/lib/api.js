// src/lib/api.js

// Directly hardcode the backend Render URL here
const API_BASE_URL = 'https://pub-game-backend.onrender.com';

export async function getAdminConfig() {
  const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
    credentials: 'include' // send cookies/token
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveJackpot(gameKey, jackpot) {
  const res = await fetch(`${API_BASE_URL}/api/admin/jackpot`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_key: gameKey, jackpot })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}