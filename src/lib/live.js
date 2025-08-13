import { WS_BASE } from './env';

// Simple WebSocket connector
export function connectLive(path = '/ws') {
  const base = (WS_BASE || '').replace(/\/+$/, '');
  const url  = new URL(base + path);

  const token = localStorage.getItem('token');
  if (token) url.searchParams.set('t', token);

  if (!/^wss?:/i.test(url.protocol)) {
    url.protocol = 'wss:'; // safe default
  }
  return new WebSocket(url.toString());
}
export default connectLive;