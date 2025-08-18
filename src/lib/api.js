// src/lib/api.js
import { API_BASE } from './env';
import { getToken, setToken as _setToken, clearToken as _clearToken } from './auth';

// Join base + path safely
function join(base, path) {
  if (!path) return base;
  if (/^https?:/i.test(path)) return path;            // absolute URL
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

// Core request wrapper (JSON by default)
export async function request(path, opts = {}) {
  const url = join(API_BASE || '', path);

  const headers = new Headers(opts.headers || {});
  if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'object') {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body && typeof opts.body === 'object' && headers.get('Content-Type')?.includes('application/json')
      ? JSON.stringify(opts.body)
      : opts.body || undefined,
    credentials: 'include',
  });

  const ctype = response.headers.get('content-type') || '';
  const data  = ctype.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.data   = data;
    throw err;
  }
  return data;
}

// ---- convenient verbs
export const get = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {}) => request(path, { ...opts, method: 'PUT',  body });
export const del  = (path, opts = {}) => request(path, { ...opts, method: 'DELETE' });

// ---- auth helpers (re-exported so pages can import from ../lib/api)
export const setToken   = (t) => _setToken(t);
export const clearToken = () => _clearToken();

// ---- admin helpers expected by pages
export async function getAdminConfig() {
  // Backend should return: { products:[...], jackpots:{crack_safe: cents, whats_in_box: cents}, ... }
  return get('/api/admin/config');
}

export async function saveJackpot(gameKey, pounds) {
  const cents = Math.round(parseFloat(pounds || '0') * 100);
  return post('/api/admin/jackpot', { game_key: gameKey, jackpot_cents: cents });
}

export async function saveProduct(gameKey, product) {
  // product: { id?, name, price_pounds, active }
  const body = {
    game_key: gameKey,
    name: product.name,
    price_cents: Math.round(parseFloat(product.price_pounds || '0') * 100),
    active: !!product.active,
    id: product.id ?? undefined,
  };
  return post('/api/admin/product', body);
}

// Provide a default export for legacy imports: `import api from '../lib/api'`
const api = { request, get, post, put, del, setToken, clearToken, getAdminConfig, saveJackpot, saveProduct };
export default api;