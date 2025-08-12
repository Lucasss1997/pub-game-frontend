import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

/** ---- tiny helpers ---- */
const poundsFromCents = (cents) =>
  typeof cents === "number" && !Number.isNaN(cents)
    ? (cents / 100).toFixed(2)
    : "0.00";

const centsFromPounds = (str) => {
  const val = (str ?? "").toString().trim();
  // accepts 12, 12.3, 12.34
  if (!/^\d+(\.\d{1,2})?$/.test(val)) return null;
  return Math.round(parseFloat(val) * 100);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** ---- component ---- */
export default function Admin() {
  const navigate = useNavigate();

  // products: array of { id|null, game_key, name, price_cents, active }
  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState("0.00"); // pounds string
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [diag, setDiag] = useState("");

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAdminData() {
    try {
      setError("");
      setDiag("");
      const [pRes, jRes] = await Promise.all([
        fetch("/api/admin/products", {
          credentials: "include",
          headers: { ...getAuthHeaders() },
        }),
        fetch("/api/admin/jackpot", {
          credentials: "include",
          headers: { ...getAuthHeaders() },
        }),
      ]);

      if (!pRes.ok) throw new Error(`Products HTTP ${pRes.status}`);
      if (!jRes.ok) throw new Error(`Jackpot HTTP ${jRes.status}`);

      const pData = await pRes.json();
      const jData = await jRes.json();

      // normalise to array
      const list = Array.isArray(pData)
        ? pData
        : Array.isArray(pData?.products)
        ? pData.products
        : [];

      const byKey = {};
      list.forEach((p) => {
        if (p && p.game_key) byKey[p.game_key] = p;
      });

      // Ensure both products exist so UI never disappears
      const ensure = (key, name) =>
        byKey[key] ?? {
          id: null,
          game_key: key,
          name,
          price_cents: 0,
          active: true,
        };

      setProducts([
        ensure("crack_safe", "£1 Standard Entry"),
        ensure("whats_in_the_box", "£1 Standard Entry"),
      ]);

      const cents =
        typeof jData?.jackpot_cents === "number" ? jData.jackpot_cents : 0;
      setJackpot(poundsFromCents(cents));
    } catch (e) {
      setError(e.message || "Load failed");
    }
  }

  async function saveProduct(index) {
    try {
      setBusy(true);
      setError("");
      const p = products[index];

      const price_cents = centsFromPounds(poundsFromCents(p.price_cents));
      if (price_cents === null) {
        setError("Enter a valid ticket price (e.g. 2 or 2.50).");
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          id: p.id ?? undefined,
          game_key: p.game_key,
          name: p.name,
          price_cents,
          active: !!p.active,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();

      // merge back
      const next = [...products];
      next[index] = saved?.product ?? saved ?? next[index];
      setProducts(next);
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

      const res = await fetch("/api/admin/jackpot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ jackpot_cents: cents }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      // reflect the rounded value
      setJackpot(poundsFromCents(cents));
    } catch (e) {
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
        headers: { ...getAuthHeaders() },
      });
      let out = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        out += `\n${JSON.stringify(j, null, 2)}`;
      } catch {
        const text = await res.text();
        out += `\n${text}`;
      }
      setDiag(out);
    } catch (e) {
      setError(e.message || "Diagnostics failed");
    } finally {
      setBusy(false);
    }
  }

  const onProductField = (idx, key, value) => {
    setProducts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

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

        {diag && (
          <pre className="diag">{diag}</pre>
        )}
      </div>

      {/* Products */}
      {products.map((p, i) => (
        <div key={p.game_key} className="admin-card">
          <h2 className="section-title">
            {p.game_key === "crack_safe" ? "Crack the Safe" : "What’s in the Box"}
          </h2>

          <label className="field">
            <span>Product name</span>
            <input
              value={p.name ?? ""}
              onChange={(e) => onProductField(i, "name", e.target.value)}
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
                onProductField(i, "price_cents", cents === null ? 0 : cents);
              }}
              placeholder="1.00"
            />
          </label>

          <label className="field">
            <span>Active</span>
            <select
              value={p.active ? "yes" : "no"}
              onChange={(e) => onProductField(i, "active", e.target.value === "yes")}
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

      {/* Jackpot */}
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