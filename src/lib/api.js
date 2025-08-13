// src/lib/api.js
const API_BASE =
  process.env._APP_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'https://pub-game-backend.onrender.com';

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res) {
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) =>
    fetch(API_BASE + path, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      credentials: 'include', // include cookie if it exists
    }).then(handle),

  post: (path, body) =>
    fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body || {}),
      credentials: 'include',
    }).then(handle),
};