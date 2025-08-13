// src/lib/api.js
import { API_BASE } from './env';

export async function api(path, options = {}) {
  const base = (API_BASE || '').replace(/\/+$/, '');
  const url  = base + path;

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} · ${txt || res.statusText}`);
  }

  // Some endpoints may return empty; guard JSON parse.
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}
export function clearToken() {
  localStorage.removeItem('token');
}