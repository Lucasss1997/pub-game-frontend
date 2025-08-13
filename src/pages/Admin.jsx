// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./admin.css";

const GAMES = [
  { key: "crack", title: "Crack the Safe" },
  { key: "box",   title: "What's in the Box" },
];

const toPounds = (cents) => (Number.isFinite(cents) ? (cents / 100).toFixed(2) : "0.00");
const toCents = (str) => {
  const s = String(str ?? "").trim().replace(/[£,\s]/g, "");
  if (!s || s === ".") return 0;
  const m = s.match(/^\d+(\.\d{0,2})?$/);
  if (!m) throw new Error("Enter a money value like 2, 2.5, 2.50");
  return Math.round(parseFloat(s) * 100);
};

function useAuthed() {
  const [token] = useState(() => localStorage.getItem("token"));
  return Boolean(token);
}

export default function Admin() {
  const isAuthed = useAuthed();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [diag, setDiag]       = useState(null);

  // local state grouped by game
  const [jackpots, setJackpots] = useState({ crack: 0, box: 0 });
  const [products, setProducts] = useState({
    crack: { game_key: "crack", name: "£1 Standard Entry", price_cents: 100, active: true },
    box:   { game_key: "box",   name: "£1 Standard Entry", price_cents: 100, active: true },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // NEW: fetch everything the admin page needs
        const data = await api.get("/api/admin/config");

        if (!mounted) return;

        // productsByGame: { crack: {...}, box: {...} }
        const pb = data.productsByGame || {};
        const jb = data.jackpotsByGame || {};

        setProducts({
          crack: pb.crack ?? { game_key: "crack", name: "£1 Standard Entry", price_cents: 100, active: true },
          box:   pb.box   ?? { game_key: "box",   name: "£1 Standard Entry", price_cents: 100, active: true },
        });

        setJackpots({
          crack: Number(jb.crack ?? 0),
          box:   Number(jb.box   ?? 0),
        });

        setDiag({ products_count: data.productsCount ?? 0, jackpots_keys: Object.keys(jb).length });
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!isAuthed) return <Navigate to="/login" replace />;

  const handleSaveProduct = async (gameKey) => {
    try {
      setError("");
      const p = products[gameKey];
      // validate/convert price to cents
      const price_cents = toCents(toPounds(p.price_cents)); // normalize
      const body = { products: [{ ...p, game_key: gameKey, price_cents }] };
      await api.post("/api/admin/products", body);
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  const handleSaveJackpot = async (gameKey) => {
    try {
      setError("");
      const cents = toCents(toPounds(jackpots[gameKey]));
      await api.post("/api/admin/jackpot", { game_key: gameKey, jackpot: cents });
      setJackpots((prev) => ({ ...prev, [gameKey]: cents }));
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  const onChangeProduct = (gameKey, field, value) => {
    setProducts((prev) => ({
      ...prev,
      [gameKey]: { ...prev[gameKey], [field]: value },
    }));
  };

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title">Admin</h1>
        <div className="actions">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
          <button className="btn ghost" onClick={() => navigate("/enter/preview")}>New game</button>
          <button className="btn ghost" onClick={() => navigate("/billing")}>Billing</button>
          <button className="btn solid" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
        </div>

        {error && <div className="alert error"> {error} </div>}
        {diag && (
          <pre className="diag">{JSON.stringify(diag, null, 2)}</pre>
        )}
      </div>

      {loading ? (
        <div className="admin-card"><p>Loading…</p></div>
      ) : (
        <>
          {GAMES.map(({ key, title }) => {
            const p = products[key];
            const j = jackpots[key];
            return (
              <div key={key} className="admin-card">
                <h2 className="section-title">{title}</h2>

                {/* Jackpot (per-game) */}
                <div className="field">
                  <span>Jackpot (£)</span>
                  <input
                    inputMode="decimal"
                    value={toPounds(j)}
                    onChange={(e) => {
                      const v = e.target.value;
                      // store as cents in state, tolerate in-progress typing
                      const safe = v.replace(/[^\d.]/g, "");
                      const partsOk = /^\d*\.?\d{0,2}$/.test(safe);
                      if (partsOk) {
                        const cents = safe ? Math.round(parseFloat(safe) * 100) : 0;
                        setJackpots((prev) => ({ ...prev, [key]: cents }));
                      }
                    }}
                  />
                </div>
                <div className="actions">
                  <button className="btn solid" onClick={() => handleSaveJackpot(key)}>Save jackpot</button>
                </div>

                <hr style={{ border: 0, borderTop: "2px dashed #7a2dda55", margin: "12px 0" }} />

                {/* Single product editor per game */}
                <div className="field">
                  <span>Product name</span>
                  <input
                    value={p.name}
                    onChange={(e) => onChangeProduct(key, "name", e.target.value)}
                  />
                </div>

                <div className="field">
                  <span>Ticket price (£)</span>
                  <input
                    inputMode="decimal"
                    value={toPounds(p.price_cents)}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d.]/g, "");
                      if (/^\d*\.?\d{0,2}$/.test(v)) {
                        onChangeProduct(key, "price_cents", v ? Math.round(parseFloat(v) * 100) : 0);
                      }
                    }}
                  />
                </div>

                <div className="field">
                  <span>Active</span>
                  <select
                    value={p.active ? "yes" : "no"}
                    onChange={(e) => onChangeProduct(key, "active", e.target.value === "yes")}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="actions">
                  <button className="btn solid" onClick={() => handleSaveProduct(key)}>Save</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}