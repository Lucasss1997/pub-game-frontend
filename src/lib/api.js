// src/lib/api.js
import { API_BASE } from './env';

export async function api(path, options = {}) {
  const url = API_BASE + path;
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} · ${txt || res.statusText}`);
  }
  try { return await res.json(); } catch { return {}; }
}

export function setToken(token) { if (token) localStorage.setItem('token', token); }
export function clearToken()     { localStorage.removeItem('token'); }