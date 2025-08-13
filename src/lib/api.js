// Single tiny wrapper around fetch with JSON + credentials.
// Exposes: api.get, api.post, api.put, api.del and token helpers.

import { API_BASE } from "./env";

const BASE = (API_BASE || "").replace(/\/+$/, "");

const json = async (res) => {
  if (!res.ok) {
    // Try to read JSON error; fall back to text
    let detail;
    try { detail = await res.json(); } catch { detail = await res.text(); }
    const msg = typeof detail === "object" && detail?.error
      ? detail.error
      : (detail || `HTTP ${res.status}`);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  // 204 etc: no content
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
};

const req = (method) => async (path, body) => {
  const url = BASE + path;
  const options = {
    method,
    credentials: "include",              // send/receive cookies
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  return json(res);
};

export const api = {
  get:  req("GET"),
  post: req("POST"),
  put:  req("PUT"),
  del:  req("DELETE"),
};

// Optional localStorage token helpers (if you use Authorization elsewhere)
export const setToken = (t) => localStorage.setItem("token", t || "");
export const clearToken = () => localStorage.removeItem("token");
export const getToken = () => localStorage.getItem("token") || "";