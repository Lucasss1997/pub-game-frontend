// src/lib/api.js
// Fetch wrapper that is BOTH callable and has .get/.post helpers.
// Also exports tiny auth helpers used across the app.

import { API_BASE } from './env';

const base = (API_BASE || '').replace(/\/+$/, '');

// ---- auth helpers ----
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}
export function getToken() {
  return localStorage.getItem('token') || '';
}
export function clearToken() {
  localStorage.removeItem('token');
}

// ---- core request ----
async function request(method, path, body) {
  const url = base + path;
  const headers = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---- create a callable wrapper ----
function createApi() {
  // Callable signature: api(path, { method, body })
  const callable = (path, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    return request(method, path, opts.body);
  };

  // Convenience methods
  callable.get  = (path)         => request('GET',    path);
  callable.post = (path, body)   => request('POST',   path, body);
  callable.put  = (path, body)   => request('PUT',    path, body);
  callable.del  = (path, body)   => request('DELETE', path, body);

  return callable;
}

export const api = createApi();
export default api;