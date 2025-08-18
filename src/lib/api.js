// src/lib/api.js
import { API_BASE } from './env';

/**
 * Minimal fetch wrapper with token support.
 * Works with both default and named imports.
 */

let authToken = localStorage.getItem('token') || '';

export function setToken(t) {
  authToken = t || '';
  if (t) localStorage.setItem('token', t);
  else   localStorage.removeItem('token');
}

export function clearToken() {
  setToken('');
}

async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    ...rest,
  };
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

  const res = await fetch(url, init);
  const text = await res.text();

  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---- convenient verbs
export const get = (path, opts = {})            => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {})     => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {})     => request(path, { ...opts, method: 'PUT',  body });
export const del  = (path, opts = {})           => request(path, { ...opts, method: 'DELETE' });

// ---- admin helpers
export async function getAdminConfig() {
  // Returns the products (if any) and jackpots for both games
  return get('/api/admin/config');
}

export async function saveJackpot(gameKey, pounds) {
  const cents = Math.round((Number(pounds) || 0) * 100);
  return post('/api/admin/jackpot', { gameKey, jackpot_cents: cents });
}

export async function saveProduct(gameKey, product) {
  // product: { name, price_pounds, active }
  const body = {
    gameKey,
    name: product.name,
    price_cents: Math.round((Number(product.price_pounds) || 0) * 100),
    active: !!product.active,
  };
  return post('/api/admin/product', body);
}

// --- legacy/ergonomic export objects
const api = { get, post, put, del, setToken, clearToken, getAdminConfig, saveJackpot, saveProduct };

// Export **both** ways so all existing imports succeed
export { api };
export default api;