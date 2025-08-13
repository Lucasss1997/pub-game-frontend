// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../ui/pubgame-theme.css";
import "./admin.css";
import { api } from "../lib/api";

const GAME_LABEL = {
  crack_the_safe: "Crack the Safe",
  whats_in_the_box: "What's in the Box",
  raffle: "Raffle",
};

function Money({ value }) {
  const v = (Number(value || 0) / 100).toFixed(2);
  return <>£{v}</>;
}

export default function Admin() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]); // [{game_key,name,price_cents,active}]
  const [jackpots, setJackpots] = useState({}); // { game_key: cents }
  const [saving, setSaving] = useState({});     // keyed by game_key

  async function fetchAll() {
    setLoading(true);
    setErr("");
    try {
      const data = await api("/api/admin/products");
      setProducts(data.products || []);
      setJackpots(data.jackpots || {});
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  function localPrice(game_key) {
    const p = products.find(x => x.game_key === game_key);
    return p ? (p.price_cents / 100).toFixed(2) : "0.00";
  }

  function setLocalPrice(game_key, poundsStr) {
    const cents = Math.round(Number(poundsStr || 0) * 100);
    setProducts(prev =>
      prev.map(p => p.game_key === game_key ? { ...p, price_cents: cents } : p)
    );
  }

  function setLocalName(game_key, name) {
    setProducts(prev =>
      prev.map(p => p.game_key === game_key ? { ...p, name } : p)
    );
  }

  function setLocalActive(game_key, active) {
    setProducts(prev =>
      prev.map(p => p.game_key === game_key ? { ...p, active } : p)
    );
  }

  async function saveProduct(game_key) {
    setSaving(s => ({ ...s, [game_key]: true }));
    setErr("");
    try {
      const p = products.find(x => x.game_key === game_key);
      await api("/api/admin/product", {
        method: "POST",
        body: JSON.stringify({
          game_key,
          name: p?.name || "",
          price: (p?.price_cents || 0) / 100,
          active: !!p?.active,
        }),
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(s => ({ ...s, [game_key]: false }));
    }
  }

  async function saveJackpot(game_key) {
    setSaving(s => ({ ...s, [game_key]: true }));
    setErr("");
    try {
      const pounds = Number((jackpots[game_key] || 0) / 100).toFixed(2);
      await api("/api/admin/jackpot", {
        method: "POST",
        body: JSON.stringify({ game_key, jackpot: pounds }),
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(s => ({ ...s, [game_key]: false }));
    }
  }

  if (loading) {
    return (
      <div className="wrap">
        <div className="card"><h1>Admin</h1><p>Loading…</p></div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <div className="toolbar">
          <Link to="/dashboard" className="btn ghost">Back to Dashboard</Link>
          <Link to="/pricing" className="btn ghost">New Game</Link>
          <Link to="/billing" className="btn ghost">Billing</Link>
          <button className="btn" onClick={() => { localStorage.removeItem("token"); nav("/login"); }}>
            Logout
          </button>
        </div>
        <h1>Admin</h1>
        {err && <div className="alert error">{err}</div>}
      </div>

      {products.map((p) => {
        const game_key = p.game_key;
        const label = GAME_LABEL[game_key] || game_key;
        const jpCents = jackpots[game_key] || 0;

        return (
          <div className="card" key={game_key}>
            <h2>{label}</h2>

            {/* jackpot box for this game */}
            <div className="field">
              <span>Jackpot (£)</span>
              <input
                type="number"
                step="0.01"
                value={(jpCents / 100).toFixed(2)}
                onChange={(e) => {
                  const val = Math.round(Number(e.target.value || 0) * 100);
                  setJackpots(prev => ({ ...prev, [game_key]: val }));
                }}
              />
            </div>
            <button
              className="btn solid"
              disabled={!!saving[game_key]}
              onClick={() => saveJackpot(game_key)}
            >
              {saving[game_key] ? "Saving…" : "Save Jackpot"}
            </button>

            <hr className="sep" />

            {/* product fields */}
            <div className="field">
              <span>Product name</span>
              <input
                value={p.name || ""}
                onChange={(e) => setLocalName(game_key, e.target.value)}
              />
            </div>

            <div className="field">
              <span>Ticket price (£)</span>
              <input
                type="number"
                step="0.01"
                value={localPrice(game_key)}
                onChange={(e) => setLocalPrice(game_key, e.target.value)}
              />
            </div>

            <div className="field">
              <span>Active</span>
              <select
                value={p.active ? "yes" : "no"}
                onChange={(e) => setLocalActive(game_key, e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <button
              className="btn"
              disabled={!!saving[game_key]}
              onClick={() => saveProduct(game_key)}
            >
              {saving[game_key] ? "Saving…" : "Save"}
            </button>
          </div>
        );
      })}
    </div>
  );
}