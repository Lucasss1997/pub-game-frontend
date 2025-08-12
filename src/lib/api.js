// src/lib/api.js
// Robust API helper that works in CRA, Vite, or plain <script> setups.

const BASE =
  // Vite (e.g. VITE_APP_API_BASE=https://… in .env)
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_APP_API_BASE || import.meta.env.VITE_API_BASE)) ||
  // CRA (e.g. REACT_APP_API_BASE=https://… in .env)
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.REACT_APP_API_BASE || process.env.REACT_APP_APIURL)) ||
  // Window fallback (you can set window._APP_API_BASE in index.html if you like)
  (typeof window !== 'undefined' && window._APP_API_BASE) ||
  // Hard default so we don’t crash if nothing is set:
  'https://pub-game-backend.onrender.com';

function full(path) {
  if (!path) throw new Error('No path provided to api helper');
  if (/^https?:\/\//i.test(path)) return path;        // already absolute
  // ensure exactly one slash between base and path
  return `${BASE.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}`;
}

async function handle(r) {
  if (!r.ok) {
    let body = '';
    try { body = await r.text(); } catch {}
    throw new Error(`HTTP ${r.status} · ${body || r.statusText}`);
  }
  const ct = r.headers.get('content-type') || '';
  return ct.includes('application/json') ? r.json() : r.text();
}

export const api = {
  async get(path, opts = {}) {
    const r = await fetch(full(path), {
      method: 'GET',
      credentials: 'include',
      ...opts,
    });
    return handle(r);
  },
  async post(path, data = {}, opts = {}) {
    const r = await fetch(full(path), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: JSON.stringify(data),
      ...opts,
    });
    return handle(r);
  },
};

export function getApiBase() { return BASE; } // handy for diagnostics