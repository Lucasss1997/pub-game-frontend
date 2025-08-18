// src/lib/api.js
// Central HTTP helper used across the app.
// Exports BOTH a named `api` and a default export, plus verb helpers
// and a few convenience functions (getAdminConfig, saveJackpot, etc.).

/* ================= Base ================= */
const BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/+$/, '');

/* ================= Core fetch wrapper ================= */
async function request(path, {
  method = 'GET',
  body,
  headers = {},
  auth = true,
} = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };

  if (auth) {
    const t = localStorage.getItem('token');
    if (t) opts.headers.Authorization = `Bearer ${t}`;
  }

  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const text = await res.text();

  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/* ================= Auth helpers ================= */
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
export function clearToken() { setToken(''); }

/* ================= Verb helpers ================= */
export const get  = (path, opts = {})            => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts = {})      => request(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts = {})      => request(path, { ...opts, method: 'PUT', body });
export const del  = (path, opts = {})            => request(path, { ...opts, method: 'DELETE' });

/* ================= Convenience API calls ================= */
/* Auth */
export const login     = (email, password)  => post('/api/login',    { email, password }, { auth: false });
export const register  = (payload)          => post('/api/register', payload,              { auth: false });
export const me        = ()                 => get('/api/me');

/* Dashboard */
export const fetchDashboard = ()            => get('/api/dashboard');

/* Admin – products & jackpots
   NOTE: These are thin wrappers; adjust paths if your backend differs. */
export const getAdminConfig = ()            => get('/api/admin/products');

/** Update/create a product for a gameKey.
 *  `product` example: { name: '£1 Standard Entry', price_pounds: 1.00, active: true }
 */
export const saveProduct = (gameKey, product) =>
  put(`/api/admin/product/${encodeURIComponent(gameKey)}`, product);

/** Save jackpot for a gameKey in *pounds* (frontend sends pounds, backend may store cents). */
export const saveJackpot = (gameKey, jackpot_pounds) =>
  post('/api/admin/jackpot', { game_key: gameKey, jackpot_pounds });

/* Games (public/player) */
export const fetchGamePublic = (pubId, gameKey) =>
  get(`/api/game/${encodeURIComponent(pubId)}/${encodeURIComponent(gameKey)}`);

/* Staff */
export const staffAssistEntry = (payload) => post('/api/staff/assist-entry', payload);

/* Billing (stub helpers) */
export const fetchBilling = () => get('/api/billing');

/* Optional: create new game (admin) */
export const createGame = (payload) => post('/api/admin/game', payload);

/* ================= Aggregate export object ================= */
export const api = {
  BASE,
  request,
  get, post, put, del,
  setToken, clearToken,
  // convenience
  login, register, me,
  fetchDashboard,
  getAdminConfig, saveProduct, saveJackpot,
  fetchGamePublic,
  staffAssistEntry,
  fetchBilling,
  createGame,
};

export default api;