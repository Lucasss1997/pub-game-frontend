// src/lib/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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