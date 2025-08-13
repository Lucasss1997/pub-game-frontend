// src/lib/api.js
// Use CRA/Webpack-style env var only, to avoid any import.meta access.
const API_BASE =
  (process.env.REACT_APP_API_BASE || '').replace(/\/+$/, ''); // trim trailing slash

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Bearer fallback
    },
    credentials: 'include', // send cookies for auth cookies
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} · ${txt || res.statusText}`);
  }
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}
export function clearToken() {
  localStorage.removeItem('token');
}