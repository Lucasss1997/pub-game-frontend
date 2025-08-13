// src/lib/api.js
// Thin wrapper around fetch that automatically attaches the JWT from localStorage
// and normalizes JSON handling & errors.

import { API_BASE } from "./env";

if (!API_BASE) {
  // Helpful console hint during dev if the .env isn't set
  // (doesn't break the build)
  // eslint-disable-next-line no-console
  console.warn(
    "[api] REACT_APP_API_BASE is not set. Set it in your .env (e.g. https://pub-game-backend.onrender.com)"
  );
}

/** Persist/remove the JWT */
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/** Read the current JWT */
export function getToken() {
  return localStorage.getItem("token");
}

/** True if a token exists */
export function isAuthed() {
  return !!getToken();
}

/** Clear token helper */
export function logout() {
  setToken(null);
}

/** Core request function */
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();

  // Compose headers
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  // Build absolute URL
  const base = (API_BASE || "").replace(/\/+$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
        ? body
        : typeof body === "string"
        ? body
        : JSON.stringify(body),
  });

  // Try to parse JSON; fall back to text
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

// Export a simple API surface
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};