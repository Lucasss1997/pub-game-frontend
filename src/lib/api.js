// src/lib/api.js

// Hardcoded backend Render URL
const API_BASE_URL = 'https://pub-game-backend.onrender.com';

/**
 * Fetch the admin configuration (products, jackpots, etc.)
 */
export async function getAdminConfig() {
  const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
    credentials: 'include' // send cookies/token if required
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Save jackpot value for a specific game
 */
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

// Default export for compatibility with "import api from '../lib/api'"
export default {
  getAdminConfig,
  saveJackpot
};