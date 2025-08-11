// Central API helper – ALWAYS sends the JWT if present
const BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data ?? {};
}

export const api = {
  get: (p) => apiFetch(p),
  post: (p, body) => apiFetch(p, { method: 'POST', body }),
  put: (p, body) => apiFetch(p, { method: 'PUT', body }),
  del: (p) => apiFetch(p, { method: 'DELETE' }),
};

// Optional helpers
export function logoutAndRedirect() {
  localStorage.removeItem('token');
  window.location.replace('/login');
}