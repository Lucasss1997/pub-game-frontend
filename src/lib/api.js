// src/lib/api.js — full drop‑in with rich errors
const BASE = process.env.REACT_APP_API_BASE || '';

function authHeader() {
  try {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(headers || {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, opts);
  } catch (e) {
    // Network/CORS/DNS error
    const err = new Error('Network error');
    err.cause = e;
    throw err;
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(
      (data && typeof data === 'object' && (data.error || data.message)) ||
      res.statusText ||
      'Request failed'
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};