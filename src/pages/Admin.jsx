// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";                  // stays in src/pages
import { api } from "../lib/api";      // <— NOTE the ../lib path (inside src)

export default function Admin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // products state keyed by game_key
  const [products, setProducts] = useState({
    crack_safe: { id: null, game_key: "crack_safe", name: "£1 Standard Entry", price: "0.00", active: true },
    whats_in_the_box: { id: null, game_key: "whats_in_the_box", name: "£1 Standard Entry", price: "0.00", active: true },
  });

  // jackpot state (in pounds as string for UI)
  const [jackpot, setJackpot] = useState("0.00");
  const [saving, setSaving] = useState({}); // per-section saving flags

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        // load products
        const prod = await api.get("/api/admin/products");
        // ensure array then map into our keyed shape
        const byKey = { ...products };
        (Array.isArray(prod) ? prod : []).forEach(p => {
          if (p && (p.game_key === "crack_safe" || p.game_key === "whats_in_the_box")) {
            byKey[p.game_key] = {
              id: p.id ?? null,
              game_key: p.game_key,
              name: p.name || byKey[p.game_key].name,
              price: toPounds(p.price_cents),
              active: !!p.active,
            };
          }
        });
        setProducts(byKey);

        // load jackpot
        const jp = await api.get("/api/admin/jackpot");
        if (jp && typeof jp.jackpot_cents === "number") {
          setJackpot(toPounds(jp.jackpot_cents));
        }
      } catch (e) {
        setError(prettyErr(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // utils
  function toPounds(cents) {
    const n = Number(cents ?? 0);
    return (n / 100).toFixed(2);
  }
  function toCents(poundsStr) {
    // accept "1", "1.5", "1.50", "£1.50"
    const clean = String(poundsStr).replace(/[^0-9.]/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(clean)) throw new Error("Please enter a valid price like 2 or 2.50");
    return Math.round(parseFloat(clean) * 100);
  }
  function prettyErr(e) {
    if (e?.response?.error) return `HTTP ${e.response.status || ""} · ${JSON.stringify(e.response.error)}`;
    if (e?.message) return e.message;
    return "Load failed";
  }

  // save handlers
  const saveProduct = async (game_key) => {
    setError("");
    setSaving(s => ({ ...s, [game_key]: true }));
    try {
      const p = products[game_key];
      await api.post("/api/admin/products", {
        game_key,
        name: p.name,
        price_cents: toCents(p.price),
        active: !!p.active,
      });
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setSaving(s => ({ ...s, [game_key]: false }));
    }
  };

  const saveJackpot = async () => {
    setError("");
    setSaving(s => ({ ...s, jackpot: true }));
    try {
      await api.post("/api/admin/jackpot", {
        jackpot_cents: toCents(jackpot),
      });
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setSaving(s => ({ ...s, jackpot: false }));
    }
  };

  const runDiagnostics = async () => {
    setError("");
    setSaving(s => ({ ...s, diag: true }));
    try {
      const me = await api.get("/api/me");
      const prods = await api.get("/api/admin/products");
      const jp = await api.get("/api/admin/jackpot");
      console.log({ me, products: prods?.length, jackpot_cents: jp?.jackpot_cents ?? null });
      alert("Diagnostics OK. Check console for details (Render logs).");
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setSaving(s => ({ ...s, diag: false }));
    }
  };

  // UI helpers
  const ProductCard = ({ label, game_key }) => {
    const p = products[game_key];

    return (
      <section className="admin-card">
        <h2>{label}</h2>

        <label className="field">
          <span>Product name</span>
          <input
            value={p.name}
            onChange={(e) =>
              setProducts((old) => ({ ...old, [game_key]: { ...old[game_key], name: e.target.value } }))
            }
            placeholder="Ticket name"
          />
        </label>

        <label className="field">
          <span>Ticket price (£)</span>
          <input
            inputMode="decimal"
            value={p.price}
            onChange={(e) =>
              setProducts((old) => ({ ...old, [game_key]: { ...old[game_key], price: e.target.value } }))
            }
            placeholder="0.00"
          />
        </label>

        <label className="field">
          <span>Active</span>
          <select
            value={p.active ? "yes" : "no"}
            onChange={(e) =>
              setProducts((old) => ({ ...old, [game_key]: { ...old[game_key], active: e.target.value === "yes" } }))
            }
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <button className="btn primary" onClick={() => saveProduct(game_key)} disabled={!!saving[game_key]}>
          {saving[game_key] ? "Saving..." : "Save"}
        </button>
      </section>
    );
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header admin-card">
        <h1>ADMIN</h1>
        <p>Set ticket prices, toggle availability, and manage the jackpot.</p>

        {error && <div className="alert error">{error}</div>}

        <div className="row">
          <button className="btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          <button className="btn ghost" onClick={runDiagnostics} disabled={!!saving.diag}>
            {saving.diag ? "Running..." : "Run diagnostics"}
          </button>
        </div>
      </div>

      {loading ? (
        <section className="admin-card"><p>Loading…</p></section>
      ) : (
        <>
          <ProductCard label="Crack the Safe" game_key="crack_safe" />
          <ProductCard label="What’s in the Box" game_key="whats_in_the_box" />

          <section className="admin-card">
            <h2>Jackpot</h2>
            <label className="field">
              <span>Jackpot (£)</span>
              <input
                inputMode="decimal"
                value={jackpot}
                onChange={(e) => setJackpot(e.target.value)}
                placeholder="0.00"
              />
            </label>

            <button className="btn primary" onClick={saveJackpot} disabled={!!saving.jackpot}>
              {saving.jackpot ? "Saving..." : "Save Jackpot"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}