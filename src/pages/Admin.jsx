// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";          // { get, post } helper
import "../ui/pubgame-theme.css";          // your theme
import "./admin.css";                      // your admin styles (if present)

const GAME_TITLES = {
  crack_safe: "Crack the Safe",
  whats_in_the_box: "What's in the Box",
  raffle: "Raffle",
};

function poundsFromCents(cents) {
  const n = Number(cents || 0);
  return (n / 100).toFixed(2);
}

function centsFromPounds(input) {
  if (input === null || input === undefined) return 0;
  const s = String(input).trim().replace(/[£,\s]/g, "");
  if (!s) return 0;
  const n = Number(s);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export default function Admin() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [diag, setDiag] = useState("");
  const [jackpotPounds, setJackpotPounds] = useState("0.00");

  // flat products from API
  const [products, setProducts] = useState([]);

  // ----- derived: grouped by game_key with a stable order
  const grouped = useMemo(() => {
    const g = {};
    for (const p of products) {
      const key = p.game_key || "other";
      if (!g[key]) g[key] = [];
      g[key].push(p);
    }
    // Optional: sort products within each game by price asc
    Object.values(g).forEach(list =>
      list.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0))
    );
    return g;
  }, [products]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // current backend returns { products, jackpot_cents }
        const data = await api.get("/api/admin/products");

        // normalise product fields
        const normalised = (data?.products || []).map((p) => ({
          id: p.id ?? null,
          game_key: p.game_key,
          name: p.name || "",
          price_cents: Number(p.price_cents || 0),
          active: !!p.active,
        }));

        setProducts(normalised);
        setJackpotPounds(poundsFromCents(data?.jackpot_cents ?? 0));

        setDiag(JSON.stringify({ products: normalised.length, jackpot_cents: data?.jackpot_cents ?? 0 }, null, 2));
      } catch (e) {
        setErr(readableError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveJackpot = async () => {
    try {
      setErr("");
      const resp = await api.post("/api/admin/jackpot", {
        jackpot: jackpotPounds,
      });
      setDiag((d) => d + `\nSaved jackpot: ${JSON.stringify(resp)}`);
    } catch (e) {
      setErr(readableError(e));
    }
  };

  // save a single edited product row
  const saveProduct = async (idx, edited) => {
    try {
      setErr("");
      // update local state immediately
      setProducts((prev) => {
        const copy = [...prev];
        copy[idx] = edited;
        return copy;
      });

      // backend expects an array on /api/admin/products
      await api.post("/api/admin/products", {
        products: [
          {
            id: edited.id ?? null,
            game_key: edited.game_key,
            name: edited.name,
            price: poundsFromCents(edited.price_cents),
            active: !!edited.active,
          },
        ],
      });
      setDiag((d) => d + `\nSaved product: ${edited.name}`);
    } catch (e) {
      setErr(readableError(e));
    }
  };

  // helpers to edit a particular product
  const setField = (idx, field, value) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <div className="actions" style={{ flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={() => nav("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn ghost" onClick={() => nav("/pricing")}>
            New Game
          </button>
          <button className="btn ghost" onClick={() => nav("/billing")}>
            Billing
          </button>
          <button
            className="btn solid"
            onClick={() => {
              localStorage.removeItem("token");
              nav("/login");
            }}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        </div>

        <h1 className="admin-title">Admin</h1>

        {err ? (
          <div className="alert error">{err}</div>
        ) : null}

        <button
          className="btn ghost"
          onClick={() =>
            setDiag(
              JSON.stringify(
                {
                  products: products.length,
                  sample: products.slice(0, 2),
                },
                null,
                2
              )
            )
          }
        >
          Run diagnostics
        </button>

        {diag && (
          <pre className="diag">{diag}</pre>
        )}
      </div>

      {/* Jackpot (pub-level; per-game can be added when server exposes it) */}
      <div className="admin-card">
        <h2 className="section-title">Jackpot</h2>
        <div className="field">
          <span>Jackpot (£)</span>
          <input
            inputMode="decimal"
            value={jackpotPounds}
            onChange={(e) => setJackpotPounds(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="actions">
          <button className="btn solid" onClick={saveJackpot}>
            Save jackpot
          </button>
        </div>
      </div>

      {/* Render a section for each game_key present */}
      {Object.keys(grouped).map((gameKey) => {
        const title = GAME_TITLES[gameKey] || "Other";
        return (
          <div className="admin-card" key={gameKey}>
            <h2 className="section-title">{title}</h2>

            {(grouped[gameKey] || []).map((row) => {
              const idx = products.findIndex(
                (p) => p === row // same object instance
              );
              const priceStr = poundsFromCents(row.price_cents);

              return (
                <div
                  key={`${gameKey}-${row.id ?? row.name}-${idx}`}
                  style={{ borderTop: "2px dashed #5c36e6", paddingTop: 12, marginTop: 12 }}
                >
                  <div className="field">
                    <span>Product name</span>
                    <input
                      value={row.name}
                      onChange={(e) => setField(idx, "name", e.target.value)}
                      placeholder="Name shown to players"
                    />
                  </div>

                  <div className="field">
                    <span>Ticket price (£)</span>
                    <input
                      inputMode="decimal"
                      value={priceStr}
                      onChange={(e) =>
                        setField(idx, "price_cents", centsFromPounds(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="field">
                    <span>Active</span>
                    <select
                      value={row.active ? "yes" : "no"}
                      onChange={(e) =>
                        setField(idx, "active", e.target.value === "yes")
                      }
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="actions">
                    <button
                      className="btn solid"
                      onClick={() => saveProduct(idx, products[idx])}
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {loading && (
        <div className="admin-card">
          <div>Loading…</div>
        </div>
      )}
    </div>
  );
}

function readableError(e) {
  if (!e) return "Error";
  if (typeof e === "string") return e;
  if (e?.response?.status) {
    const body = e.response.data ?? e.response.statusText ?? "";
    try {
      const maybe = typeof body === "string" ? JSON.parse(body) : body;
      if (maybe?.error) return `HTTP ${e.response.status} · ${maybe.error}`;
    } catch {
      /* ignore */
    }
    return `HTTP ${e.response.status} · ${body || "Request failed"}`;
  }
  if (e?.message) return e.message;
  return "Request failed";
}