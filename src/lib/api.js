// src/lib/api.js
import { API_BASE } from "./env";

let TOKEN = null;

export function setToken(t) {
  TOKEN = t || null;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}
export function clearToken() {
  setToken(null);
}
export function getToken() {
  return TOKEN || localStorage.getItem("token") || null;
}

function buildUrl(path) {
  const base = (API_BASE || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return base ? `${base}/${p}` : `/${p}`;
}

async function request(path, { method = "GET", headers = {}, body, ...rest } = {}) {
  const url = buildUrl(path);
  const token = getToken();

  const h = { "Content-Type": "application/json", ...headers };
  if (token) h.Authorization = `Bearer ${token}`;

  const opts = { method, headers: h, credentials: "include", ...rest };
  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  // Convert non-2xx into readable errors
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j && j.error) msg += ` · ${JSON.stringify(j)}`;
      else if (text) msg += ` · ${text}`;
    } catch {
      if (text) msg += ` · ${text}`;
    }
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// Named helpers
export const get  = (p, o = {})           => request(p, { ...o, method: "GET"  });
export const post = (p, body, o = {})     => request(p, { ...o, method: "POST", body });
export const put  = (p, body, o = {})     => request(p, { ...o, method: "PUT",  body });

// Default callable export
export default function api(path, opts) {
  return request(path, opts);
}