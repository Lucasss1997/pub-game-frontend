// src/lib/api.js

// Hardcoded backend URL
const API_BASE_URL = 'https://pub-game-backend.onrender.com';

/** Fetch the admin configuration (products, jackpots, etc.) */
export async function getAdminConfig() {
  const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Save jackpot value for a specific game */
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

/** Named object export so `import { api } from '../lib/api'` works */
export const api = {
  getAdminConfig,
  saveJackpot,
};

/** Default export so `import api from '../lib/api'` works */
export default api;