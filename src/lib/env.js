// src/lib/env.js
const clean = (s) => (s || '').trim().replace(/\/+$/, ''); // trims trailing slashes

const RAW_API = clean(process.env.REACT_APP_API_BASE);
const RAW_WS  = clean(process.env.REACT_APP_WS_BASE);

// API base like https://pub-game-backend.onrender.com (empty string is allowed)
export const API_BASE = RAW_API;

// WS base like wss://pub-game-backend.onrender.com
export const WS_BASE =
  RAW_WS || (API_BASE ? API_BASE.replace(/^http/i, 'ws') : '');