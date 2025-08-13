import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function WhatsInTheBox() {
  const { pubId: routePubId } = useParams();
  const pubId = routePubId ? Number(routePubId) : 1;
  const gameKey = "whats_in_the_box";

  const [meta, setMeta] = useState(null);
  const [msg, setMsg] = useState("");
  const wsRef = useRef(null);

  useEffect(() => {
    let died = false;
    (async () => {
      try {
        const data = await api.get(`/api/game/${pubId}/${gameKey}/meta`);
        if (!died) setMeta(data);
      } catch {
        if (!died) setMsg("Unable to load game.");
      }
    })();
    return () => { died = true; };
  }, [pubId]);

  useEffect(() => {
    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", topic: `jackpot:${pubId}:${gameKey}` }));
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.type === "jackpot" && m.pubId === pubId && m.gameKey === gameKey) {
          setMeta((old) => (old ? { ...old, jackpot_cents: m.jackpot_cents } : old));
        }
      };
      return () => ws.close();
    } catch {}
  }, [pubId]);

  if (!meta) {
    return (
      <div className="page">
        <h1>What’s in the Box</h1>
        <p>Loading… {msg}</p>
      </div>
    );
  }

  const price = (meta.price_cents ?? 0) / 100;
  const jackpot = (meta.jackpot_cents ?? 0) / 100;

  async function handleBuy() {
    try {
      await api.post(`/api/game/${pubId}/${gameKey}/ticket`, { amount: meta.price_cents });
      setMeta((m) => ({ ...m, jackpot_cents: (m?.jackpot_cents ?? 0) + (meta.price_cents ?? 0) }));
      setMsg("Ticket purchased.");
    } catch {
      setMsg("Could not purchase.");
    }
  }

  return (
    <div className="page">
      <h1>What’s in the Box</h1>
      <p>Ticket: £{price.toFixed(2)} • Jackpot: £{jackpot.toFixed(2)}</p>

      <div className="card">
        {/* Keep your existing box UI here */}
        <div className="actions">
          <button className="btn solid" onClick={handleBuy}>
            Buy Ticket (£{price.toFixed(2)})
          </button>
        </div>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}