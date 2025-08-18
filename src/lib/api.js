// src/lib/api.js
import { API_BASE } from './env';

const BASE = (API_BASE || '').replace(/\/+$/, '');

// ---------- Token helpers ----------
export function setToken(t) {
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}
export function clearToken() { setToken(''); }

function authHeader() {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ---------- Core request ----------
async function request(path, { method = 'GET', body, headers } = {}) {
  const url = /^https?:/i.test(path) ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const init = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(headers || {}),
    },
  };
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

  const res = await fetch(url, init);
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    err.status = res.status;
    err.response = { data, status: res.status };
    throw err;
  }
  return data;
}

// ---------- Generic verbs (named) ----------
export const get  = (path, opts = {}) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {}) => request(path, { ...opts, method: 'PUT',  body });
export const del  = (path, opts = {}) => request(path, { ...opts, method: 'DELETE' });

// ---------- High-level helpers used by pages ----------
export async function login(email, password) {
  const r = await post('/api/login', { email, password });
  if (r?.token) setToken(r.token);
  return r;
}
export async function logout() {
  try { await post('/api/logout'); } finally { clearToken(); }
}
export const ensureUser = (email, password, pubName) =>
  post('/api/register', { email, password, pubName }); // or your /ensure endpoint if different

export const getDashboard = () => get('/api/dashboard');

// Admin page expects these:
export const getAdminConfig = () => get('/api/admin/products'); // adjust if your endpoint differs
export const saveProducts   = (products) => post('/api/admin/products', { products });
export const saveJackpot    = (gameKey, jackpot) =>
  post('/api/admin/jackpot', { game_key: gameKey, jackpot });

// Staff/manual entry helpers (if used):
export const staffAddEntry  = ({ pubId, gameKey, playerName, tickets = 1, paid_pence }) =>
  post('/api/staff/add-entry', { pubId, gameKey, playerName, tickets, paid_pence });

// Player flows:
export const getGameConfig  = (pubId, gameKey) => get(`/api/games/${pubId}/${gameKey}`);
export const startCheckout  = (payload) => post('/api/checkout/start', payload);

// ---------- Default export (legacy `import api from '../lib/api'`) ----------
const api = {
  // verbs
  get, post, put, del, setToken, clearToken,
  // helpers
  login, logout, ensureUser, getDashboard,
  getAdminConfig, saveProducts, saveJackpot,
  staffAddEntry, getGameConfig, startCheckout,
};
export default api;