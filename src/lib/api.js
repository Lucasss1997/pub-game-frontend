import { authHeader, clearToken } from './auth';

const API_BASE = process.env.REACT_APP_API_BASE || ''; 
// e.g. set REACT_APP_API_BASE="https://pub-game-backend.onrender.com"

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit', // using header tokens
  });

  // Try to parse JSON safely
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (res.status === 401) {
    clearToken();
    // soft redirect for SPAs
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(data?.error || 'Unauthorized');
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
};
