// src/lib/auth.js

// Save token to localStorage
export function setToken(token) {
  try {
    localStorage.setItem('token', token);
  } catch (err) {
    console.error('Error saving token to localStorage:', err);
  }
}

// Retrieve token from localStorage
export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch (err) {
    console.error('Error retrieving token from localStorage:', err);
    return null;
  }
}

// Remove token from localStorage (logout)
export function clearToken() {
  try {
    localStorage.removeItem('token');
  } catch (err) {
    console.error('Error removing token from localStorage:', err);
  }
}