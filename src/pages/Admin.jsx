// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";               // <-- default export, callable
import "../ui/pubgame-theme.css";          // site theme
import "./admin.css";                      // optional page tweaks if you have it

// --- small helpers ---
const money = (cents) => (Math.round(+cents || 0) / 100).toFixed(2);
const toCents = (poundsLike) => {
  if (poundsLike === "" || poundsLike == null) return 0;
  const s = String(poundsLike).trim().replace(/[£,\s]/g, "");
  const v = Number(s);
  return Number.isFinite(v) ? Math.round(v * 100) : 0;
};

// Try to detect game bucket from product fields
function detectBucket(p) {
  const key = (p.game_key || "").toLowerCase();
  const nm = (p.name || "").toLowerCase();
  if (key.includes("safe") || nm.includes("safe")) return "safe";
  if (key.includes("box") || nm.includes("box")) return "box";
  return "other";
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // editable products
  const [products, setProducts] = useState([]); // [{id?, game_key, name, price_cents, active}]
  // per-game jackpots (pounds text fields)
  const [jackpots, setJackpots] = useState({ safe: "0.00", box: "0.00" });
  const [saving, setSaving] = useState({}); // keyed by thing being saved

  // --- API call using your default api() export ---
  async function call(path, options = {}) {
    try {
      // ensure JSON by default
      const opts = {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      };
      if (opts.body && typeof opts.body !== "string") {
        opts.body = JSON.stringify(opts.body);
      }
      const res = await api(path, opts); // <- your api() should return parsed JSON
      return res;
    } catch (e) {
      // If your api() throws, bubble up a readable message
      const msg = e?.message || "Request failed";
      throw new Error(msg);
    }
  }

  // --- load admin data ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) products for this pub
        //    server should respond with array: [{ id, game_key, name, price_cents, active }, ...]
        const prodResp = await call("/api/admin/products", { method: "GET" });
        const rows = Array.isArray(prodResp?.products) ? prodResp.products : (Array.isArray(prodResp) ? prodResp : []);
        setProducts(
          rows.map((r) => ({
            id: r.id,
            game_key: r.game_key || detectBucket(r), // keep any existing key; fallback by detection
            name: r.name || "",
            price_cents: Number(r.price_cents) || 0,
            active: !!r.active,
          }))
        );

        // 2) per-game jackpots
        //    Preferred: GET /api/admin/jackpots -> { safe_cents, box_cents }
        //    Fallback (older server): GET /api/admin/jackpot -> { jackpot_cents } — treat as 0 for both
        let jp = { safe: "0.00", box: "0.00" };
        try {
          const j = await call("/api/admin/jackpots", { method: "GET" });
          const safeC = Number(j?.safe_cents) || 0;
          const boxC = Number(j?.box_cents) || 0;
          jp = { safe: money(safeC), box: money(boxC) };
        } catch {
          // fallback
          try {
            const single = await call("/api/admin/jackpot", { method: "GET" });
            const only = Number(single?.jackpot_cents) || 0;
            // keep both as that value to start (you can change one then save per-game)
            jp = { safe: money(only), box: money(only) };
          } catch {
            // ignore, remain 0
          }
        }
        setJackpots(jp);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // group products for UI
  const groups = useMemo(() => {
    const g = { safe: [], box: [], other: [] };
    for (const p of products) {
      g[detectBucket(p)].push(p);
    }
    return g;
  }, [products]);

  // --- handlers ---
  const updateProductField = (idx, field, value, bucket) => {
    setProducts((prev) => {
      const next = [...prev];
      // find the product at visual index inside the chosen bucket
      const sameBucket = prev
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => detectBucket(p) === bucket);
      const item = sameBucket[idx];
      if (!item) return prev;
      const originalIndex = item.i;
      next[originalIndex] = { ...next[originalIndex], [field]: value };
      return next;
    });
  };

  const saveProduct = async (idx, bucket) => {
    setSaving((s) => ({ ...s, [`prod_${bucket}_${idx}`]: true }));
    setErr("");
    try {
      // locate the same record again
      const sameBucket = products
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => detectBucket(p) === bucket);
      const item = sameBucket[idx];
      if (!item) throw new Error("Product not found in state.");

      const rec = item.p;
      const body = {
        // server upsert format: { products: [{ game_key, name, price, active }] }
        products: [
          {
            id: rec.id,
            game_key: detectBucket(rec),
            name: rec.name,
            price: money(rec.price_cents),
            active: !!rec.active,
          },
        ],
      };

      await call("/api/admin/products", { method: "POST", body });
      // reflect any normalization (e.g., ensuring game_key)
      setProducts((prev) => {
        const next = [...prev];
        next[item.i] = { ...rec, game_key: detectBucket(rec) };
        return next;
      });
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSaving((s) => ({ ...s, [`prod_${bucket}_${idx}`]: false }));
    }
  };

  const saveJackpot = async (bucket) => {
    setSaving((s) => ({ ...s, [`jp_${bucket}`]: true }));
    setErr("");
    try {
      // Preferred endpoint: POST /api/admin/jackpots { game_key, jackpot }
      // Fallback (older server): POST /api/admin/jackpot { jackpot }  (applies one global)
      const pounds = jackpots[bucket] || "0.00";
      const bodyPreferred = { game_key: bucket, jackpot: pounds };
      const bodyFallback = { jackpot: pounds };

      try {
        await call("/api/admin/jackpots", { method: "POST", body: bodyPreferred });
      } catch {
        await call("/api/admin/jackpot", { method: "POST", body: bodyFallback });
      }
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSaving((s) => ({ ...s, [`jp_${bucket}`]: false }));
    }
  };

  const Section = ({ title, bucket }) => {
    const list = groups[bucket] || [];
    return (
      <div className="admin-card">
        <h2 className="section-title">{title}</h2>

        {list.length === 0 && (
          <p style={{ margin: "6px 0 12px 0", opacity: 0.8 }}>
            No products configured yet for this game.
          </p>
        )}

        {list.map((rec, idx) => (
          <div key={`${bucket}-${idx}`} style={{ borderTop: "1px dashed #6e38d5", paddingTop: 12, marginTop: 12 }}>
            <div className="field">
              <span>Product name</span>
              <input
                value={rec.name}
                onChange={(e) => updateProductField(idx, "name", e.target.value, bucket)}
                placeholder="Product name"
              />
            </div>

            <div className="field">
              <span>Ticket price (£)</span>
              <input
                inputMode="decimal"
                value={money(rec.price_cents)}
                onChange={(e) => updateProductField(idx, "price_cents", toCents(e.target.value), bucket)}
                placeholder="0.00"
              />
            </div>

            <div className="field">
              <span>Active</span>
              <select
                value={rec.active ? "Yes" : "No"}
                onChange={(e) => updateProductField(idx, "active", e.target.value === "Yes", bucket)}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div className="actions">
              <button
                className="btn solid"
                disabled={!!saving[`prod_${bucket}_${idx}`]}
                onClick={() => saveProduct(idx, bucket)}
              >
                {saving[`prod_${bucket}_${idx}`] ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ))}

        {/* Jackpot under the game section */}
        {(bucket === "safe" || bucket === "box") && (
          <div style={{ borderTop: "1px dashed #6e38d5", paddingTop: 14, marginTop: 14 }}>
            <div className="field">
              <span>Jackpot (£)</span>
              <input
                inputMode="decimal"
                value={jackpots[bucket]}
                onChange={(e) => setJackpots((j) => ({ ...j, [bucket]: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="actions" style={{ marginBottom: 8 /* small gap before next section */ }}>
              <button
                className="btn solid"
                disabled={!!saving[`jp_${bucket}`]}
                onClick={() => saveJackpot(bucket)}
              >
                {saving[`jp_${bucket}`] ? "Saving…" : "Save Jackpot"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title" style={{ marginBottom: 10 }}>Admin</h1>
        <div className="actions" style={{ flexWrap: "wrap" }}>
          <a className="btn ghost" href="/dashboard">Back to Dashboard</a>
          <a className="btn ghost" href="/enter/preview">New Game</a>
          <a className="btn ghost" href="/billing">Billing</a>
          <a className="btn solid" href="/login?logout=1">Logout</a>
        </div>

        {err && <div className="alert error">{String(err)}</div>}
        {loading && <p style={{ marginTop: 6 }}>Loading…</p>}
      </div>

      {/* Game Sections */}
      <Section title="Crack the Safe" bucket="safe" />
      <Section title="What's in the Box" bucket="box" />

      {/* Anything not detected as safe/box goes here */}
      {groups.other.length > 0 && <Section title="Other" bucket="other" />}
    </div>
  );
}