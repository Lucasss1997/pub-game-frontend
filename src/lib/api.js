// src/lib/api.js
// One tiny API client used everywhere. Works with both default and named imports.

import { API_BASE } from './env';

let _token = localStorage.getItem('token') || '';

export function setToken(t) {
  _token = t || '';
  if (_token) localStorage.setItem('token', _token);
  else localStorage.removeItem('token');
}

export function clearToken() {
  setToken('');
}

function toUrl(path) {
  // Allow absolute URLs; otherwise prefix with API_BASE
  if (/^https?:\/\//i.test(path)) return path;
  const base = (API_BASE || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${base}/${p}`;
}

async function request(method, path, body) {
  const url = toUrl(path);

  const headers = {
    'Accept': 'application/json',
  };

  const opts = { method, headers, credentials: 'include' };

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(url, opts);

  // Try to parse JSON, but allow empty bodies
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(
      (data && (data.message || data.error)) ||
      `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function get(path)    { return request('GET',    path); }
export function post(path,b) { return request('POST',   path, b); }
export function put(path,b)  { return request('PUT',    path, b); }
export function del(path,b)  { return request('DELETE', path, b); }

// Default object AND named export to satisfy both import styles in the app
const api = { get, post, put, del, setToken, clearToken };
export { api };
export default api;