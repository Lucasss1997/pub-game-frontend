// src/lib/api.js
// Centralized fetch wrapper + auth helpers, with both default and named `api` export.

const BASE = process.env.REACT_APP_API_BASE || '';

/* ---------------- Fetch core ---------------- */
async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };

  if (auth) {
    const t = localStorage.getItem('token');
    if (t) opts.headers.Authorization = `Bearer ${t}`;
  }

  if (body !== undefined) opts.body = typeof body === 'string' ? body : JSON.stringify(body);

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

/* ---------------- Token helpers ---------------- */
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function clearToken() {
  setToken('');
}

/* ---------------- Verb helpers ---------------- */
export const get = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body });
export const put = (path, body, opts = {}) => request(path, { ...opts, method: 'PUT', body });
export const del = (path, opts = {}) => request(path, { ...opts, method: 'DELETE' });

/* ---------------- api object (named AND default) ---------------- */
export const api = { request, get, post, put, del, setToken, clearToken };
export default api;