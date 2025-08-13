// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./admin.css";

export default function Admin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [diag, setDiag] = useState(null);

  // products shown on the page (array of objects)
  const [products, setProducts] = useState([]);
  // single jackpot field (backend expects one value today)
  const [jackpot, setJackpot] = useState("");

  // --- helpers ----
  const centsToPounds = (cents) =>
    typeof cents === "number" ? (cents / 100).toFixed(2) : "0.00";

  const poundsToString = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim();
    return s === "" ? "" : s;
  };

  const parsePounds = (s) => {
    const cleaned = String(s || "")
      .trim()
      .replace(/[£,\s]/g, "")
      .replace(/p$/i, "");
    if (!cleaned) return "0.00";
    // keep at most 2 dp
    const num = Number(cleaned);
    if (!Number.isFinite(num)) return "0.00";
    return num.toFixed(2);
  };

  // --- load initial data (safe + compatible with current backend) ---
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        // Use /api/dashboard (auth) as the reliable source
        const dash = await api.get("/api/dashboard");

        const prodRows = Array.isArray(dash?.products) ? dash.products : [];

        // Normalize product rows for the form
        const norm = prodRows.map((p) => ({
          game_key: p.game_key,
          name: p.name || "",
          price: centsToPounds(p.price_cents ?? 0),
          active: !!p.active,
        }));

        if (mounted) {
          setProducts(norm);
          const jp = dash?.stats?.jackpot_cents ?? 0;
          setJackpot(centsToPounds(jp));
          setDiag({
            products: norm.length,
            jackpot_cents: jp ?? 0,
          });
        }
      } catch (e) {
        if (mounted) {
          setErr(prettyErr(e));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function prettyErr(e) {
    if (!e) return "Unknown error";
    if (typeof e === "string") return e;
    if (e.message) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return "Error";
    }
  }

  // --- actions ---
  async function onSaveJackpot() {
    setErr("");
    try {
      const body = { jackpot: parsePounds(jackpot) };
      await api.post("/api/admin/jackpot", body); // backend expects one value today
      alert("Jackpot saved");
    } catch (e) {
      setErr(prettyErr(e));
    }
  }

  async function onSaveProduct(idx) {
    setErr("");
    try {
      const p = products[idx];
      const payload = [
        {
          game_key: p.game_key,
          name: p.name,
          price: parsePounds(p.price),
          active: !!p.active,
        },
      ];
      await api.post("/api/admin/products", { products: payload });
      alert(`Saved “${p.name || p.game_key}”`);
    } catch (e) {
      setErr(prettyErr(e));
    }
  }

  function updateProduct(idx, patch) {
    setProducts((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  // --- UI ---
  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title">Admin</h1>

        <div className="actions">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn ghost" onClick={() => navigate("/enter/1/crack_safe")}>
            New Game
          </button>
          <button className="btn ghost" onClick={() => navigate("/billing")}>
            Billing
          </button>
          <button
            className="btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        </div>

        {err && (
          <div className="alert error">HTTP • {err}</div>
        )}

        {diag && (
          <pre className="diag">{JSON.stringify(diag, null, 2)}</pre>
        )}
      </div>

      {/* Jackpot section (current backend = one jackpot) */}
      <div className="admin-card">
        <h2 className="section-title">Jackpot</h2>
        <div className="field">
          <span>Jackpot (£)</span>
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={poundsToString(jackpot)}
            onChange={(e) => setJackpot(e.target.value)}
          />
        </div>
        <div className="actions">
          <button className="btn" disabled={loading} onClick={onSaveJackpot}>
            Save Jackpot
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="admin-card">
        <h2 className="section-title">Crack the Safe</h2>
        {loading && <div>Loading…</div>}
        {!loading && products.length === 0 && (
          <div>No products configured yet.</div>
        )}
        {!loading &&
          products.map((p, i) => (
            <div
              key={p.game_key || i}
              style={{
                borderTop: "1px dashed #3b1bb8",
                paddingTop: 10,
                marginTop: 10,
              }}
            >
              <div className="field">
                <span>Product name</span>
                <input
                  value={p.name}
                  onChange={(e) =>
                    updateProduct(i, { name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <span>Ticket price (£)</span>
                <input
                  inputMode="decimal"
                  value={p.price}
                  onChange={(e) =>
                    updateProduct(i, { price: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <span>Active</span>
                <select
                  value={p.active ? "yes" : "no"}
                  onChange={(e) =>
                    updateProduct(i, { active: e.target.value === "yes" })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="actions">
                <button className="btn" onClick={() => onSaveProduct(i)}>
                  Save
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}