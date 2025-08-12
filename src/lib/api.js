// src/lib/api.js
export const API_BASE = process.env.REACT_APP_API_URL || 'https://pub-game-backend.onrender.com';

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed`);
    return res.json();
  }
};