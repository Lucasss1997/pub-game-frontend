// src/lib/auth.js
const KEY = 'token';

export function getToken() {
  return localStorage.getItem(KEY) || '';
}

export function setToken(t) {
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export default { getToken, setToken, clearToken };