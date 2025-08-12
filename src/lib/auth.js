// src/lib/auth.js
export function setToken(token) {
  localStorage.setItem('token', token);
}
export function getToken() {
  return localStorage.getItem('token');
}
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
export function logout() {
  localStorage.removeItem('token');
}