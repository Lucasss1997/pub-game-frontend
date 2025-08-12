import React, { useEffect, useState } from 'react';
import { connectLive } from '../../lib/live';
import { api } from '../../lib/api';

export default function WhatsInTheBoxPublic() {
  const [pubId, setPubId] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(200);
  const [jackpot, setJackpot] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const dash = await api.get('/api/dashboard');
        const id = dash?.pubs?.[0]?.id || 1;
        setPubId(id);

        const p = await api.get('/api/admin/products');
        const list = Array.isArray(p?.products) ? p.products : [];
        const item = list.find(x => x.game_key === 'whats_in_the_box');
        if (item) setTicketPrice(item.price_cents);

        const j = await api.get('/api/admin/jackpot');
        if (typeof j?.jackpot_cents === 'number') setJackpot(j.jackpot_cents);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!pubId) return;
    const es = connectLive(pubId, {
      onProducts: (p) => {
        if (p?.game_key === 'whats_in_the_box' && typeof p.price_cents === 'number') {
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
      <h1>What’s in the Box</h1>
      <p>Ticket: £{(ticketPrice/100).toFixed(2)} · Jackpot: £{(jackpot/100).toFixed(2)}</p>
      {/* ...rest of your game UI... */}
    </div>
  );
}