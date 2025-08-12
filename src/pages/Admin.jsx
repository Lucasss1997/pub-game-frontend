import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

// ---------- helpers ----------
const poundsFromCents = (cents) =>
  typeof cents === "number" && !Number.isNaN(cents)
    ? (cents / 100).toFixed(2)
    : "0.00";

const centsFromPounds = (val) => {
  const s = (val ?? "").toString().trim();
  // allow 12, 12.3, 12.34
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
};

const authHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Create the two product placeholders so UI is NEVER empty
const defaultProducts = () => ([
  { id: null, game_key: "crack_safe",       name: "£1 Standard Entry", price_cents: 0, active: true },
  { id: null, game_key: "whats_in_the_box", name: "£1 Standard Entry", price_cents: 0, active: true },
]);

// ---------- component ----------
export default function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(defaultProducts());
  const [jackpot, setJackpot]   = useState("0.00");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [diag, setDiag]         = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      setError("");
      setDiag("");
      const [pRes, jRes] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include", headers: { ...authHeaders() } }),
        fetch("/api/admin/jackpot",  { credentials: "include", headers: { ...authHeaders() } }),
      ]);

      // If either fails, still show the two cards
      if (pRes.ok) {
        const pJson = await pRes.json();
        const list = Array.isArray(pJson)
          ? pJson
          : Array.isArray(pJson?.products)
          ? pJson.products
          : [];
        // Map the list into our two known keys; keep placeholders if missing
        const map = Object.fromEntries(list.filter(Boolean).map(p => [p.game_key, p]));
        const merged = defaultProducts().map(d => map[d.game_key] ? { ...d, ...map[d.game_key] } : d);
        setProducts(merged);
      } else {
        setProducts(defaultProducts());
      }

      if (jRes.ok) {
        const j = await jRes.json();
        setJackpot(poundsFromCents(typeof j?.jackpot_cents === "number" ? j.jackpot_cents : 0));
      }
    } catch (e) {
      // Still keep the placeholders visible
      setProducts(defaultProducts());
      setError(e.message || "Load failed");
    }
  }

  function updateProduct(idx, key, value) {
    setProducts(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  async function saveProduct(idx) {
    try {
      setBusy(true);
      setError("");
      const p = products[idx];

      const cents = centsFromPounds(poundsFromCents(p.price_cents));
      if (cents === null) {
        setError("Enter a valid ticket price (e.g. 2 or 2.50).");
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          id: p.id ?? undefined,
          game_key: p.game_key,
          name: p.name,
          price_cents: cents,
          // send string mirror as well in case the backend pattern expects it
          price: String(cents),
          active: !!p.active,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      // Accept {product: {...}} or direct object
      const merged = saved?.product ?? saved;
      setProducts(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], ...merged };
        return next;
      });
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveJackpot(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");

      const cents = centsFromPounds(jackpot);
      if (cents === null) {
        setError("Enter a valid jackpot (e.g. 100 or 2.50).");
        return;
      }

      // Post both numeric and string fields to satisfy strict schemas
      const res = await fetch("/api/admin/jackpot", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          jackpot_cents: cents,
          jackpot: String(cents),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      setJackpot(poundsFromCents(cents));
    } catch (e) {
      // Show server validator messages if they come as JSON string
      setError(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function runDiagnostics() {
    try {
      setBusy(true);
      setError("");
      const res = await fetch("/api/admin/debug", {
        credentials: "include",
        headers: { ...authHeaders() },
      });
      let out = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        out += `\n${JSON.stringify(j, null, 2)}`;
      } catch {
        out += `\n${await res.text()}`;
      }
      setDiag(out);
    } catch (e) {
      setError(e.message || "Diagnostics failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h1 className="admin-title">ADMIN</h1>
        <p className="admin-sub">
          Set ticket prices, toggle availability, and manage the jackpot.
        </p>

        {error && <div className="alert error">{error}</div>}

        <div className="actions">
          <button className="btn ghost" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn" onClick={runDiagnostics} disabled={busy}>
            Run diagnostics
          </button>
        </div>

        {diag && <pre className="diag">{diag}</pre>}
      </div>

      {/* Always render both product cards */}
      {products.map((p, i) => (
        <div key={p.game_key} className="admin-card">
          <h2 className="section-title">
            {p.game_key === "crack_safe" ? "Crack the Safe" : "What’s in the Box"}
          </h2>

          <label className="field">
            <span>Product name</span>
            <input
              value={p.name ?? ""}
              onChange={(e) => updateProduct(i, "name", e.target.value)}
              placeholder="£1 Standard Entry"
            />
          </label>

          <label className="field">
            <span>Ticket price (£)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={poundsFromCents(p.price_cents)}
              onChange={(e) => {
                const cents = centsFromPounds(e.target.value);
                updateProduct(i, "price_cents", cents === null ? 0 : cents);
              }}
              placeholder="1.00"
            />
          </label>

          <label className="field">
            <span>Active</span>
            <select
              value={p.active ? "yes" : "no"}
              onChange={(e) => updateProduct(i, "active", e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <button className="btn solid" onClick={() => saveProduct(i)} disabled={busy}>
            Save
          </button>
        </div>
      ))}

      <div className="admin-card">
        <h2 className="section-title">Jackpot</h2>
        <form onSubmit={saveJackpot}>
          <label className="field">
            <span>Jackpot (£)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={jackpot}
              onChange={(e) => setJackpot(e.target.value)}
              placeholder="0.00"
            />
          </label>
          <button className="btn solid" disabled={busy}>
            Save jackpot
          </button>
        </form>
      </div>
    </div>
  );
}