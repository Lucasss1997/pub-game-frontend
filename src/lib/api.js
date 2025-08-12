// src/lib/api.js
// Uses your .env value REACT_APP_API_BASE for the backend URL.
// Fallbacks to your Render backend if not set.
const API_BASE = process.env.REACT_APP_API_BASE || 'https://pub-game-backend.onrender.com';

function authHeader() {
  const token = localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res, path, method) {
  if (!res.ok) {
    let msg = `${method} ${path} failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      credentials: 'include',
    });
    return handle(res, path, 'GET');
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });
    return handle(res, path, 'POST');
  },

  async put(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });
    return handle(res, path, 'PUT');
  },

  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      credentials: 'include',
    });
    return handle(res, path, 'DELETE');
  },
};

export { API_BASE };