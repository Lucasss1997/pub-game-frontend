// src/lib/api.js
const BASE =
  process.env.REACT_APP_API_BASE ||
  process.env._APP_API_BASE ||            // your mobile editor env var
  "http://localhost:5000";

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} · ${detail || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}