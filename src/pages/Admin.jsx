// src/pages/Admin.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getAdminConfig,
  saveJackpot,
  getProduct,
  saveProduct,
} from "../lib/api";

import "../ui/pubgame-theme.css";

const GAMES = [
  { key: "crack_the_safe", title: "Crack the Safe" },
  { key: "whats_in_the_box", title: "What’s in the Box" },
];

function PoundsInput({ value, onChange, placeholder = "0.00" }) {
  return (
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function GameSection({ gameKey, title }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // product state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("1.00");
  const [active, setActive] = useState(true);

  // jackpot state
  const [jackpot, setJackpot] = useState("0.00");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // Load product (if it exists yet)
      try {
        const p = await getProduct(gameKey);
        if (p) {
          setName(p.name || "");
          setPrice(
            p.price_pounds != null ? String(p.price_pounds) : "1.00"
          );
          setActive(!!p.active);
        }
      } catch {
        // no product configured yet — that's fine
      }

      // Load jackpots from admin config
      try {
        const cfg = await getAdminConfig();
        const cents = cfg?.jackpots?.[gameKey];
        if (typeof cents === "number") {
          setJackpot((cents / 100).toFixed(2));
        }
      } catch {}
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, [gameKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onSaveProduct = async () => {
    try {
      await saveProduct(gameKey, {
        name: name || "Standard Entry",
        price_pounds: price || "1.00",
        active,
      });
      alert("Product saved");
    } catch (e) {
      alert("Save failed: " + String(e.message || e));
    }
  };

  const onSaveJackpot = async () => {
    try {
      await saveJackpot(gameKey, jackpot || "0");
      alert("Jackpot saved");
      await load();
    } catch (e) {
      alert("Save failed: " + String(e.message || e));
    }
  };

  return (
    <section className="admin-card">
      <h2 className="section-title">{title}</h2>
      {err && <div className="alert error">{err}</div>}
      {loading && <p>Loading…</p>}

      {/* Product editor */}
      <div className="field">
        <span>Product name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Standard Entry"
        />
      </div>

      <div className="field">
        <span>Ticket price (£)</span>
        <PoundsInput value={price} onChange={setPrice} />
      </div>

      <div className="field">
        <span>Active</span>
        <select
          value={active ? "yes" : "no"}
          onChange={(e) => setActive(e.target.value === "yes")}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="actions">
        <button className="btn solid" onClick={onSaveProduct}>
          Save product
        </button>
      </div>

      {/* Jackpot under product */}
      <hr
        style={{
          border: 0,
          borderTop: "2px dashed #7a2dda55",
          margin: "16px 0",
        }}
      />

      <div className="field">
        <span>Jackpot (£):</span>
        <PoundsInput value={jackpot} onChange={setJackpot} />
      </div>

      <div className="actions" style={{ marginBottom: 6 }}>
        <button className="btn solid" onClick={onSaveJackpot}>
          Save jackpot
        </button>
      </div>
    </section>
  );
}

export default function Admin() {
  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <div
          className="actions"
          style={{ justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Link to="/dashboard" className="btn ghost">
            Back to Dashboard
          </Link>
          <Link to="/game/new" className="btn ghost">
            New Game
          </Link>
          <Link to="/billing" className="btn ghost">
            Billing
          </Link>
          <Link to="/login" className="btn solid">
            Logout
          </Link>
        </div>
        <h1 className="admin-title">Admin</h1>
      </div>

      {GAMES.map((g) => (
        <GameSection key={g.key} gameKey={g.key} title={g.title} />
      ))}
    </div>
  );
}