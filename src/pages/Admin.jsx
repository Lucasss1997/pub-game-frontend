import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/products", {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} · ${await res.text()}`);

      const data = await res.json();

      // Ensure products is always an array
      const safeProducts = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);
      setProducts(safeProducts);

      // Jackpot fetch
      const jackpotRes = await fetch("/api/admin/jackpot", {
        credentials: "include",
      });
      if (!jackpotRes.ok) throw new Error(`HTTP ${jackpotRes.status} · ${await jackpotRes.text()}`);

      const jackpotData = await jackpotRes.json();
      setJackpot((jackpotData.jackpot_cents ?? 0) / 100);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSaveProduct = async (gameKey, updates) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ game_key: gameKey, ...updates }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} · ${await res.text()}`);
      fetchAdminData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveJackpot = async () => {
    try {
      const res = await fetch("/api/admin/jackpot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jackpot_cents: Math.round(parseFloat(jackpot) * 100) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} · ${await res.text()}`);
      fetchAdminData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <h1>ADMIN</h1>
      <p>Set ticket prices, toggle availability, and manage the jackpot.</p>

      {error && <div className="error">{error}</div>}

      <button onClick={() => navigate("/dashboard")}>BACK TO DASHBOARD</button>

      {products.map((product) => (
        <div key={product.game_key} className="product-card">
          <h2>{product.name}</h2>
          <label>
            Ticket price (£)
            <input
              type="number"
              step="0.01"
              value={product.price || ""}
              onChange={(e) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.game_key === product.game_key
                      ? { ...p, price: e.target.value }
                      : p
                  )
                )
              }
            />
          </label>
          <label>
            Active
            <select
              value={product.active ? "Yes" : "No"}
              onChange={(e) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.game_key === product.game_key
                      ? { ...p, active: e.target.value === "Yes" }
                      : p
                  )
                )
              }
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <button
            onClick={() =>
              handleSaveProduct(product.game_key, {
                price_cents: Math.round(parseFloat(product.price) * 100),
                active: product.active,
              })
            }
          >
            SAVE
          </button>
        </div>
      ))}

      <div className="jackpot-section">
        <h2>Jackpot</h2>
        <label>
          Jackpot (£)
          <input
            type="number"
            step="0.01"
            value={jackpot}
            onChange={(e) => setJackpot(e.target.value)}
          />
        </label>
        <button onClick={handleSaveJackpot}>SAVE JACKPOT</button>
      </div>
    </div>
  );
}