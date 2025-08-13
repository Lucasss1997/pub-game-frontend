import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function CrackTheSafe() {
  // From QR route you may have :pubId; if opened as demo, default to 1
  const { pubId: routePubId } = useParams();
  const pubId = routePubId ? Number(routePubId) : 1;
  const gameKey = "crack_the_safe";

  const [meta, setMeta] = useState(null); // { price_cents, jackpot_cents, name, active }
  const [guess, setGuess] = useState("");
  const [msg, setMsg] = useState("");
  const wsRef = useRef(null);

  // Load meta once
  useEffect(() => {
    let died = false;
    (async () => {
      try {
        const data = await api.get(`/api/game/${pubId}/${gameKey}/meta`);
        if (!died) setMeta(data);
      } catch (e) {
        if (!died) setMsg("Unable to load game.");
      }
    })();
    return () => { died = true; };
  }, [pubId]);

  // Live jackpot via WS
  useEffect(() => {
    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.host;
      const ws = new WebSocket(`${proto}://${host}/ws`);
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
        <h1>Crack the Safe</h1>
        <p>Loading… {msg}</p>
      </div>
    );
  }

  const price = (meta.price_cents ?? 0) / 100;
  const jackpot = (meta.jackpot_cents ?? 0) / 100;

  async function handleBuyTicket() {
    try {
      await api.post(`/api/game/${pubId}/${gameKey}/ticket`, { amount: meta.price_cents });
      // optimistic update (WS will also push)
      setMeta((m) => ({ ...m, jackpot_cents: (m?.jackpot_cents ?? 0) + (meta.price_cents ?? 0) }));
      setMsg("Ticket purchased! Good luck.");
    } catch (e) {
      setMsg("Could not purchase a ticket.");
    }
  }

  async function handleGuess(e) {
    e.preventDefault();
    if (!/^\d{3}$/.test(guess)) {
      setMsg("Enter exactly three digits.");
      return;
    }
    // Your existing safe-check logic would go here.
    // This page is about meta + jackpot; leaving game logic unchanged.
    setMsg("Guess recorded (demo).");
  }

  return (
    <div className="page">
      <h1>Crack the Safe</h1>
      <p>Ticket: £{price.toFixed(2)} • Jackpot: £{jackpot.toFixed(2)}</p>

      <div className="card">
        <div className="field">
          <span>Enter 3-digit code</span>
          <input
            inputMode="numeric"
            pattern="\d{3}"
            placeholder="000"
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, "").slice(0, 3))}
          />
        </div>
        <div className="actions">
          <button className="btn" onClick={handleGuess}>Submit Guess</button>
          <button className="btn solid" onClick={handleBuyTicket}>
            Buy Ticket (£{price.toFixed(2)})
          </button>
        </div>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}