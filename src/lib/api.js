// src/lib/api.js
// A tiny fetch wrapper that supports both default and named imports.
// Works with auth cookies and/or bearer tokens.

import { API_BASE } from "./env";

const BASE = (API_BASE || "").replace(/\/+$/, "");

// --- token helpers (both cookie or header flows) ---
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
}
export function getToken() {
  return localStorage.getItem("token") || "";
}
export function clearToken() {
  localStorage.removeItem("token");
}

// --- core request ---
async function request(path, { method = "GET", body } = {}) {
  if (!BASE) throw new Error("API base not configured");

  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include", // send/receive cookies too
  });

  // Try to parse JSON; fall back to text for HTML error bodies
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// --- verbs ---
export function get(path)  { return request(path, { method: "GET" }); }
export function post(path, body) { return request(path, { method: "POST", body }); }
export function put(path, body)  { return request(path, { method: "PUT",  body }); }
export function del(path)        { return request(path, { method: "DELETE" }); }

// Default export so you can also `import api from '../lib/api'`
const api = { get, post, put, del, setToken, clearToken, getToken };
export default api;