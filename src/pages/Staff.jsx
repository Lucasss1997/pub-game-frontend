// src/pages/Staff.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../ui/pubgame-theme.css";
import { API_BASE } from "../lib/env"; // <- central env (no import.meta)

function normalizeUkMobile(input) {
  if (!input) return "";
  let s = String(input).trim().replace(/\s+/g, "");
  if (s.startsWith("+44")) s = "0" + s.slice(3);
  return s.replace(/[^\d]/g, "");
}
function isUkMobile(s) {
  const n = normalizeUkMobile(s);
  return /^07\d{9}$/.test(n);
}
const fmtGBP = (c) => (Math.round(c || 0) / 100).toFixed(2);

async function jget(path) {
  const r = await fetch(API_BASE + path, {
    credentials: "include",
    headers: withBearer(),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function jpost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...withBearer() },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const d = await r.json(); if (d?.error) msg += ` · ${d.error}`; } catch {}
    throw new Error(msg);
  }
  return r.json();
}
function withBearer() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function Staff() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [products, setProducts] = useState([]);     // [{game_key,name,price_cents,active}]
  const [poolByGame, setPoolByGame] = useState({}); // { game_key: jackpot_cents }
  const [gameKey, setGameKey] = useState("");
  const [qty, setQty] = useState(1);
  const [mobile, setMobile] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(""); setOk("");
      try {
        const dash = await jget("/api/dashboard");
        const active = (dash.products || []).filter(p => p.active);
        // if you have a /api/admin/pools endpoint, prefer that; otherwise derive 0
        const poolsMap = {};
        (dash.pools || []).forEach(p => { poolsMap[p.game_key] = p.jackpot_cents || 0; });
        if (alive) {
          setProducts(active);
          setPoolByGame(poolsMap);
          if (active.length && !gameKey) setGameKey(active[0].game_key);
        }
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => products.find(p => p.game_key === gameKey),
    [products, gameKey]
  );
  const priceCents = selected?.price_cents || 0;
  const potCents = poolByGame[gameKey] || 0;

  async function addEntry() {
    setErr(""); setOk("");
    try {
      const q = Math.max(1, Number(qty) || 1);
      const body = { game_key: gameKey, quantity: q };
      if (mobile) {
        if (!isUkMobile(mobile)) {
          setErr("Enter a valid UK mobile (07XXXXXXXXX or +447XXXXXXXXX), or leave blank.");
          return;
        }
        body.mobile = normalizeUkMobile(mobile);
      }
      if (note) body.note = note.slice(0, 120);

      const out = await jpost("/api/staff/entry", body);
      setPoolByGame(prev => ({ ...prev, [gameKey]: out.jackpot_cents || potCents }));
      setOk(`Added ${out.quantity} ticket(s). New jackpot: £${fmtGBP(out.jackpot_cents)}`);
      setQty(1); setMobile(""); setNote("");
    } catch (e) {
      setErr(e.message || "Failed to add entry");
    }
  }

  return (
    <div className="pg-wrap">
      <div className="card max">
        <h1 className="page-title">Staff – Manual Entries</h1>
        <p>Add tickets for customers without a phone. This increments the selected game’s jackpot and session count.</p>

        {loading && <div className="alert">Loading…</div>}
        {err && <div className="alert error">{err}</div>}
        {ok && <div className="alert">✅ {ok}</div>}

        {!loading && products.length === 0 && (
          <div className="alert">No active games found. Enable products in the Admin page.</div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="field">
              <label>Game</label>
              <select value={gameKey} onChange={e => setGameKey(e.target.value)}>
                {products.map(p => (
                  <option key={p.game_key} value={p.game_key}>
                    {p.name} — Ticket £{fmtGBP(p.price_cents)} — Jackpot £{fmtGBP(poolByGame[p.game_key] || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tickets</label>
              <input type="number" min={1} max={1000} value={qty} onChange={e => setQty(e.target.value)} />
            </div>

            <div className="field">
              <label>Customer mobile (optional)</label>
              <input placeholder="07XXXXXXXXX or +447XXXXXXXXX" value={mobile} onChange={e => setMobile(e.target.value)} />
            </div>

            <div className="field">
              <label>Note (optional)</label>
              <input placeholder="e.g. Cash sale" value={note} onChange={e => setNote(e.target.value)} maxLength={120} />
            </div>

            <div className="toolbar">
              <button className="btn" onClick={addEntry}>Add entry</button>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-title" style={{ marginTop: 0 }}>Summary</h2>
              <div>Selected game: <strong>{selected?.name || gameKey}</strong></div>
              <div>Ticket price: <strong>£{fmtGBP(priceCents)}</strong></div>
              <div>Current jackpot: <strong>£{fmtGBP(potCents)}</strong></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}