import React, { useEffect, useState } from 'react';
import { connectLive } from '../../lib/live';
import { api } from '../../lib/api'; // your existing helper

export default function CrackSafePublic() {
  const [pubId, setPubId] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(200); // cents default £2.00
  const [jackpot, setJackpot] = useState(0);          // cents

  // load initial pubId + prices/jackpot (you likely have pubId from QR params)
  useEffect(() => {
    (async () => {
      try {
        const dash = await api.get('/api/dashboard'); // uses token if set; otherwise pass pub via QR param in your own endpoint
        const id = dash?.pubs?.[0]?.id || 1;
        setPubId(id);

        // load current price for crack_safe
        const p = await api.get('/api/admin/products'); // if auth needed for admin, swap to a public products endpoint in future
        const list = Array.isArray(p?.products) ? p.products : [];
        const crack = list.find(x => x.game_key === 'crack_safe');
        if (crack) setTicketPrice(crack.price_cents);

        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch { /* ignore on public */ }
    })();
  }, []);

  // live updates
  useEffect(() => {
    if (!pubId) return;
    const es = connectLive(pubId, {
      onProducts: (p) => {
        if (p?.game_key === 'crack_safe' && typeof p.price_cents === 'number') {
          setTicketPrice(p.price_cents);
        }
      },
      onJackpot: (j) => {
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      },
    });
    return () => es.close && es.close();
  }, [pubId]);

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h1>Crack the Safe</h1>
      <p>Ticket: £{(ticketPrice/100).toFixed(2)} · Jackpot: £{(jackpot/100).toFixed(2)}</p>
      {/* ...rest of your game UI... */}
    </div>
  );
}