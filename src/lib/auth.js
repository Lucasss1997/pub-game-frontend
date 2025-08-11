// tiny auth helper using localStorage
const KEY = 'pg_jwt';

export function setToken(t) {
  localStorage.setItem(KEY, t);
}
export function getToken() {
  return localStorage.getItem(KEY) || '';
}
export function clearToken() {
  localStorage.removeItem(KEY);
}
export function isLoggedIn() {
  return !!getToken();
}