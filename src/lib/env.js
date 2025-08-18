// src/lib/env.js
// Single source of truth for environment values (no import.meta).

const clean = (s) => (s || '').trim().replace(/\/+$/, '');

// Allow either REACT_APP_API_BASE or REACT_APP_API_URL
const RAW_API =
  clean(process.env.REACT_APP_API_BASE) ||
  clean(process.env.REACT_APP_API_URL);

// Allow either REACT_APP_WS_BASE or REACT_APP_WS_URL
const RAW_WS =
  clean(process.env.REACT_APP_WS_BASE) ||
  clean(process.env.REACT_APP_WS_URL);

// Fallback: your actual backend on Render
const FALLBACK_API = 'https://pub-game-backend.onrender.com';

// Final values used by the app
export const API_BASE = RAW_API || FALLBACK_API;
export const WS_BASE  = RAW_WS || (API_BASE ? API_BASE.replace(/^http/i, 'ws') : '');

if (!RAW_API) {
  // eslint-disable-next-line no-console
  console.warn('[env] REACT_APP_API_BASE not set; using fallback:', API_BASE);
}

export default { API_BASE, WS_BASE };