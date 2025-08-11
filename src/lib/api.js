// src/lib/api.js
// Central API helper — always sends JWT if present, no cookies.
// Also falls back to your live backend if the env var is missing.

const DEFAULT_BASE = 'https://pub-game-backend.onrender.com';
const ENV_BASE = (process.env.REACT_APP_API_BASE || '').trim().replace(/\/$/, '');
const BASE = ENV_BASE || DEFAULT_BASE;

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      // IMPORTANT: omit cookies to keep CORS simple (we use Bearer tokens)
      credentials: 'omit',
    });
  } catch {
    throw new Error(`Network error contacting API at ${BASE}${path}`);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response; leave data as null
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data ?? {};
}

export const api = {
  get: (p) => apiFetch(p),
  post: (p, body) => apiFetch(p, { method: 'POST', body }),
  put: (p, body) => apiFetch(p, { method: 'PUT', body }),
  del: (p) => apiFetch(p, { method: 'DELETE' }),
};

export function logoutAndRedirect() {
  try { localStorage.removeItem('token'); } catch {}
  window.location.replace('/login');
}