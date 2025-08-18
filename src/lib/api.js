// src/lib/api.js
import { API_BASE } from './env';

const BASE = (API_BASE || '').replace(/\/+$/, ''); // no trailing slash

// ---- token helpers (kept in localStorage so it's stable across reloads)
export function setToken(t) {
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem('token', t);
  else   localStorage.removeItem('token');
}

export function clearToken() {
  setToken('');
}

function authHeader() {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ---- low-level request
async function request(path, { method = 'GET', body, headers } = {}) {
  const url =
    /^https?:/i.test(path) ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const init = {
    method,
    credentials: 'include', // allow cookie auth too
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(headers || {}),
    },
  };

  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

  const res = await fetch(url, init);

  // Try to parse JSON, but don’t die if it isn’t JSON
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(
      (data && (data.error || data.message)) ||
      `HTTP ${res.status}`
    );
    err.status = res.status;
    err.response = { data, status: res.status };
    throw err;
  }

  return data;
}

// ---- convenient verbs
export const get  = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {}) => request(path, { ...opts, method: 'PUT',  body });
export const del  = (path, opts = {}) => request(path, { ...opts, method: 'DELETE' });

// ---- default export for legacy imports: `import api from '../lib/api'`
const api = { get, post, put, del, setToken, clearToken };
export default api;