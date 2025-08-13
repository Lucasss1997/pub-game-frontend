// src/lib/env.js
// Single source of truth for environment values (no import.meta).

const clean = (s) => (s || '').trim().replace(/\/+$/, '');

// CRA pulls from process.env for public variables prefixed with REACT_APP_
const RAW_API = clean(process.env.REACT_APP_API_BASE);
const RAW_WS  = clean(process.env.REACT_APP_WS_BASE);

// API base like https://pub-game-backend.onrender.com
export const API_BASE = RAW_API;

// WS base like wss://pub-game-backend.onrender.com
export const WS_BASE =
  RAW_WS || (API_BASE ? API_BASE.replace(/^http/i, 'ws') : '');