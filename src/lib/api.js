// src/lib/api.js
const BASE =
  process.env.REACT_APP_API_BASE ||
  process.env._APP_API_BASE || // your current .env key
  "https://pub-game-backend.onrender.com"; // fallback

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    // THIS is the critical line: send cookies on cross‑site requests
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // If backend returns non‑JSON (e.g., 401 with html), avoid JSON parse blowups
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const api = {
  get:  (p)        => request(p),
  post: (p, body)  => request(p, { method: "POST", body }),
  put:  (p, body)  => request(p, { method: "PUT",  body }),
  del:  (p, body)  => request(p, { method: "DELETE", body }),
};