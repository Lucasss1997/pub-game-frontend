// src/lib/api.js
const BASE = (import.meta?.env?._APP_API_BASE) || process.env._APP_API_BASE || '';

function getToken() {
  try { return localStorage.getItem('token') || ''; } catch { return ''; }
}
function setToken(tok) {
  try { tok ? localStorage.setItem('token', tok) : localStorage.removeItem('token'); } catch {}
}
async function request(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });

  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok || (data && data.ok === false)) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.response = data;
    error.status = res.status;
    throw error;
  }
  return data ?? { ok:true };
}

export const api = {
  get: (p, o) => request(p, { ...o, method:'GET' }),
  post: (p, body, o) => request(p, { ...o, method:'POST', body }),
  setToken,
  getToken,
};