// src/lib/api.js
// Central API helper

import { API_BASE } from './env';

const BASE = (API_BASE || '').replace(/\/+$/, '');

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = localStorage.getItem('token');
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include', // allow cookies
    headers: { ...authHeaders(), ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// ---- Auth
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function clearToken() { setToken(''); }
export async function login(email, password) {
  const data = await req('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) setToken(data.token);
  return data;
}

// ---- Admin & config
export async function getAdminConfig() {
  return req('/api/admin/config');
}
export async function saveProduct({ game_key, name, price_pounds, active }) {
  return req('/api/admin/product', {
    method: 'POST',
    body: JSON.stringify({ game_key, name, price_pounds, active }),
  });
}
export async function saveJackpot({ game_key, jackpot }) {
  return req('/api/admin/jackpot', {
    method: 'POST',
    body: JSON.stringify({ game_key, jackpot }),
  });
}
export async function getDashboard() {
  return req('/api/dashboard');
}

// ---- Play
export async function startGame({ game_key, ticket_price_pounds }) {
  return req('/api/game/start', {
    method: 'POST',
    body: JSON.stringify({ game_key, ticket_price_pounds }),
  });
}
export async function endGame({ game_key, winner_id = null, email_breakdown = false }) {
  return req('/api/game/end', {
    method: 'POST',
    body: JSON.stringify({ game_key, winner_id, email_breakdown }),
  });
}

// Convenience verbs
export const get  = (p, o) => req(p, { method: 'GET', ...(o || {}) });
export const post = (p, b, o) => req(p, { method: 'POST', body: JSON.stringify(b || {}), ...(o || {}) });
export const put  = (p, b, o) => req(p, { method: 'PUT',  body: JSON.stringify(b || {}), ...(o || {}) });
export const del  = (p, o) => req(p, { method: 'DELETE', ...(o || {}) });

// ---- Build a default object so `import api from '../lib/api'` works
const api = {
  login,
  setToken,
  clearToken,
  getAdminConfig,
  saveProduct,
  saveJackpot,
  getDashboard,
  startGame,
  endGame,
  get,
  post,
  put,
  del,
};

export default api;