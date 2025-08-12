// src/lib/auth.js
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}
export function getToken() {
  return localStorage.getItem('token') || '';
}
export function clearToken() {
  localStorage.removeItem('token');
}
export function isLoggedIn() {
  const t = getToken();
  if (!t) return false;
  try {
    const [, payload] = t.split('.');
    const json = JSON.parse(atob(payload));
    if (json?.exp && Date.now() / 1000 >= json.exp) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    clearToken();
    return false;
  }
}