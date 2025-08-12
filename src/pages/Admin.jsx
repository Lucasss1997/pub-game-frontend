import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [jackpot, setJackpot] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchJackpot();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
    }
  };

  const fetchJackpot = async () => {
    try {
      const res = await fetch("/api/admin/jackpot", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJackpot((data.jackpot_cents / 100).toFixed(2));
    } catch (err) {
      setError("Failed to load jackpot");
    }
  };

  const saveJackpot = async () => {
    try {
      const res = await fetch("/api/admin/jackpot", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jackpot_cents: Math.round(parseFloat(jackpot) * 100) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Jackpot saved successfully");
    } catch (err) {
      setError("Failed to save jackpot");
    }
  };

  const saveProduct = async (index, updatedProduct) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedProduct)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Product updated successfully");
    } catch (err) {
      setError("Failed to save product");
    }
  };

  return (
    <div className="admin-page">
      <h1>ADMIN</h1>
      <p>Set ticket prices, toggle availability, and manage the jackpot.</p>

      {error && <div className="error">{error}</div>}

      <button onClick={() => navigate("/dashboard")} className="btn-back">
        Back to Dashboard
      </button>

      <div className="jackpot-section">
        <h2>Jackpot</h2>
        <label>Jackpot (£)</label>
        <input
          type="number"
          value={jackpot}
          onChange={(e) => setJackpot(e.target.value)}
        />
        <button onClick={saveJackpot}>Save Jackpot</button>
      </div>

      <div className="products-section">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <h3>{product.slug}</h3>
            <label>Product name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) =>
                setProducts(
                  products.map((p, i) =>
                    i === index ? { ...p, name: e.target.value } : p
                  )
                )
              }
            />
            <label>Ticket price (£)</label>
            <input
              type="number"
              value={(product.price_cents / 100).toFixed(2)}
              onChange={(e) =>
                setProducts(
                  products.map((p, i) =>
                    i === index
                      ? { ...p, price_cents: Math.round(parseFloat(e.target.value) * 100) }
                      : p
                  )
                )
              }
            />
            <label>Active</label>
            <select
              value={product.active ? "Yes" : "No"}
              onChange={(e) =>
                setProducts(
                  products.map((p, i) =>
                    i === index
                      ? { ...p, active: e.target.value === "Yes" }
                      : p
                  )
                )
              }
            >
              <option>Yes</option>
              <option>No</option>
            </select>
            <button onClick={() => saveProduct(index, products[index])}>
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;