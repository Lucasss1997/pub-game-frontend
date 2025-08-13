// src/lib/api.js
// Lightweight fetch-based API helper with both named and default exports.
// Works with your existing src/lib/env.js (API_BASE).

import { API_BASE } from './env';

const baseURL = (API_BASE || '').replace(/\/+$/, '');

let authToken = localStorage.getItem('token') || '';

function urlFor(path) {
  const p = String(path || '').trim();
  if (/^https?:/i.test(p)) return p;           // absolute
  return baseURL + (p.startsWith('/') ? p : '/' + p);
}

async function request(method, path, body, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(urlFor(path), {
    method,
    headers,
    credentials: 'include', // keep cookies if you use them
    body: body == null ? undefined : JSON.stringify(body),
    ...opts,
  });

  // Try to parse JSON; fallback to text
  let data;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Named helpers
export const get  = (path, opts)           => request('GET',    path, undefined, opts);
export const post = (path, body, opts)      => request('POST',   path, body, opts);
export const put  = (path, body, opts)      => request('PUT',    path, body, opts);
export const del  = (path, opts)            => request('DELETE', path, undefined, opts);

// Token helpers
export function setToken(token) {
  authToken = token || '';
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function clearToken() { setToken(''); }

// Also provide a default export for legacy imports like: import api from '../lib/api'
const api = { get, post, put, del, setToken, clearToken };
export default api;