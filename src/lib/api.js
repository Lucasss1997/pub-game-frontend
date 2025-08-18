// src/lib/api.js
import { API_BASE } from "./env";

// keep token in memory + localStorage
let _token = localStorage.getItem("token") || "";

export function setToken(t) {
  _token = t || "";
  if (_token) localStorage.setItem("token", _token);
  else localStorage.removeItem("token");
}
export function clearToken() { setToken(""); }
export function getToken() { return _token; }

// build URL against API_BASE and optionally append ?t=token
function buildUrl(path) {
  const full = path.startsWith("http") ? path : `${API_BASE}${path}`;
  try {
    const u = new URL(full);
    if (_token) u.searchParams.set("t", _token); // helpful for some backends
    return u.toString();
  } catch {
    // if API_BASE missing, this will show up as an obvious error
    return full;
  }
}

// central fetch wrapper
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = buildUrl(path);
  const h = { "Content-Type": "application/json", ...headers };

  // attach token in multiple ways to satisfy any backend check
  if (_token) {
    h.Authorization = `Bearer ${_token}`;
    h["x-auth-token"] = _token;
  }

  const res = await fetch(url, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // send cookies if server uses sessions
  });

  if (!res.ok) {
    let detail = "";
    try { detail = " · " + JSON.stringify(await res.json()); } catch {}
    throw new Error(`HTTP ${res.status}${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// convenient verbs
export const get  = (p, opts = {})            => request(p, { ...opts, method: "GET" });
export const post = (p, body, opts = {})      => request(p, { ...opts, method: "POST", body });
export const put  = (p, body, opts = {})      => request(p, { ...opts, method: "PUT",  body });
export const del  = (p, opts = {})            => request(p, { ...opts, method: "DELETE" });

// specific helpers
export const getAdminConfig = () => get("/api/admin/config");
export const saveJackpot     = (gameKey, pounds) =>
  post(`/api/admin/jackpot/${gameKey}`, { pounds });

// default + named exports (so both import styles work)
const api = { get, post, put, del, getAdminConfig, saveJackpot, setToken, clearToken, getToken };
export default api;
export { api };