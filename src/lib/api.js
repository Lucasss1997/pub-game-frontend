// src/lib/api.js
// Minimal, universal API helper used across the app.

import { API_BASE } from "./env";

// --- token helpers -----------------------------------------------------------
let _token = localStorage.getItem("token") || "";

export function setToken(t) {
  _token = t || "";
  if (_token) localStorage.setItem("token", _token);
  else localStorage.removeItem("token");
}

export function clearToken() {
  setToken("");
}

// --- core request ------------------------------------------------------------
async function request(path, { method = "GET", body, headers = {} } = {}) {
  // allow absolute or relative paths
  const url =
    /^https?:/i.test(path)
      ? path
      : `${(API_BASE || "").replace(/\/+$/, "")}${path}`;

  const opts = { method, headers: { ...headers } };

  if (_token) opts.headers.Authorization = `Bearer ${_token}`;

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  // Try to parse JSON, but fall back to text for non-JSON responses
  const text = await res.text();
  const data = text
    ? (() => {
        try { return JSON.parse(text); } catch { return text; }
      })()
    : null;

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (data && data.message) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

// --- convenient verbs --------------------------------------------------------
export const get  = (path, opts = {}) => request(path, { ...opts, method: "GET" });
export const post = (path, body, opts = {}) => request(path, { ...opts, method: "POST", body });
export const put  = (path, body, opts = {}) => request(path, { ...opts, method: "PUT", body });
export const del  = (path, opts = {}) => request(path, { ...opts, method: "DELETE" });

// --- admin helpers (used by Admin.jsx) --------------------------------------
// Returns config including per-game jackpots map:
// { jackpots: { crack_the_safe: 12345, whats_in_the_box: 67890 }, ... }
export const getAdminConfig = () => get("/api/admin/config");

// Save per-game jackpot in *pounds* (string or number e.g. "1.50")
export const saveJackpot = (gameKey, pounds) =>
  post(`/api/admin/jackpot/${encodeURIComponent(gameKey)}`, { pounds });

// Each game has one product (entry option)
export const getProduct = (gameKey) =>
  get(`/api/admin/product/${encodeURIComponent(gameKey)}`);
// Payload shape: { name, price_pounds, active }
export const saveProduct = (gameKey, product) =>
  post(`/api/admin/product/${encodeURIComponent(gameKey)}`, product);

// --- default + named export for compatibility with ALL import styles --------
const api = {
  get, post, put, del,
  setToken, clearToken,
  getAdminConfig, saveJackpot, getProduct, saveProduct,
};

export default api;         // allows: import api from '../lib/api'
export { api };            // allows: import { api } from '../lib/api'