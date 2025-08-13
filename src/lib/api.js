// src/lib/api.js
const BASE = process.env._APP_API_BASE || process.env.REACT_APP_API_BASE || '';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let txt = await res.text().catch(() => '');
    try { txt = JSON.parse(txt); } catch {}
    const err = new Error(`HTTP ${res.status}`);
    err.payload = txt;
    throw err;
  }
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
};