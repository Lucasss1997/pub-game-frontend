// src/lib/live.js
import { WS_BASE } from './env';

// Simple WebSocket connector; app code can add listeners.
export function connectLive(path = '/ws') {
  const base = (WS_BASE || '').replace(/\/+$/, '');
  const url  = new URL(base + path);

  // pass token for auth if you use it server-side
  const token = localStorage.getItem('token');
  if (token) url.searchParams.set('t', token);

  // Ensure ws/wss protocol
  if (!/^wss?:/i.test(url.protocol)) {
    url.protocol = 'wss:'; // safe default for production
  }

  const ws = new WebSocket(url.toString());
  return ws;
}