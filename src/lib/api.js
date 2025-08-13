// Robust fetch wrapper used everywhere.
// Exports BOTH a named `api` and default export to prevent import mismatches.
import { API_BASE } from './env';

const base = (API_BASE || '').replace(/\/+$/, '');

async function request(method, path, body) {
  const url = base + path;
  const headers = { 'Content-Type': 'application/json' };

  // include auth token if present
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body == null ? undefined : JSON.stringify(body),
  });

  // Try to parse JSON, but keep text if not JSON
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

export const api = {
  get:  (path)        => request('GET',  path),
  post: (path, body)  => request('POST', path, body),
  put:  (path, body)  => request('PUT',  path, body),
  del:  (path, body)  => request('DELETE', path, body),
};

export default api;