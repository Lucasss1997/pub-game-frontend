// Simple SSE live client
export function connectLive(pubId, { onProducts, onJackpot, onError } = {}) {
  if (!pubId) return { close(){} };
  const url = `/api/live/stream?pubId=${encodeURIComponent(pubId)}`;
  const es = new EventSource(url, { withCredentials: false });

  es.addEventListener('products.updated', (e) => {
    try { onProducts && onProducts(JSON.parse(e.data)); } catch (_) {}
  });

  es.addEventListener('jackpot.updated', (e) => {
    try { onJackpot && onJackpot(JSON.parse(e.data)); } catch (_) {}
  });

  es.onerror = (err) => { onError && onError(err); };
  return es;
}