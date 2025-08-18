// src/lib/api.js
// Unified API helper with BOTH default and named exports.
// Works with either:
//   import api from '../lib/api'            → api.get('/path')
// or:
//   import { get, post } from '../lib/api'  → get('/path')

import { API_BASE } from './env';

const BASE = (API_BASE || '').replace(/\/+$/, ''); // trim trailing slashes

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  if (!BASE) throw new Error('API_BASE is not configured');

  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...headers,
    },
    ...rest,
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const text = await res.text();

  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

// ---- convenient verbs (named exports)
export const get  = (path, opts = {})       => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {}) => request(path, { ...opts, method: 'PUT',  body });
export const del  = (path, opts = {})       => request(path, { ...opts, method: 'DELETE' });

// ---- auth helpers (named exports)
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function clearToken() { setToken(''); }

// ---- optional higher-level helpers (named exports)
export async function getAdminConfig() {
  return get('/api/admin/products');
}
export async function saveJackpot(gameKey, pounds) {
  const cents = Math.round((Number(pounds) || 0) * 100);
  return post(`/api/admin/jackpot/${encodeURIComponent(gameKey)}`, { jackpot_cents: cents });
}

// ---- default export for legacy usage
const api = { get, post, put, del, setToken, clearToken, getAdminConfig, saveJackpot };
export default api;