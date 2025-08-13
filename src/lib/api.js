// src/lib/api.js
const API_BASE =
  import.meta.env.VITE_APP_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  ''; // e.g. https://pub-game-backend.onrender.com

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Bearer fallback
    },
    credentials: 'include', // send cookies for Safari/iOS
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} · ${txt || res.statusText}`);
  }
  // may be empty body (204 etc.)
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