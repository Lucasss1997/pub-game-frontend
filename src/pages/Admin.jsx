import React, { useEffect, useState } from "react";
import { get, put } from "../lib/api";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [jackpots, setJackpots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsData = await get("/api/admin/products");
        const jackpotsData = await get("/api/admin/jackpots");
        setProducts(productsData);
        setJackpots(jackpotsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveProduct = async (productId, updatedProduct) => {
    try {
      await put(`/api/admin/products/${productId}`, updatedProduct);
      alert("Product updated!");
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    }
  };

  const handleSaveJackpot = async (gameKey) => {
    try {
      await put(`/api/admin/jackpots/${gameKey}`, {
        amount: jackpots[gameKey] || 0,
      });
      alert("Jackpot updated!");
    } catch (error) {
      console.error(error);
      alert("Failed to update jackpot");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Group products by game
  const grouped = products.reduce((acc, product) => {
    if (!acc[product.game]) acc[product.game] = [];
    acc[product.game].push(product);
    return acc;
  }, {});

  return (
    <div>
      <h1>Admin</h1>
      <div className="admin-container">
        {Object.entries(grouped).map(([game, gameProducts]) => (
          <div key={game} style={{ marginBottom: "40px" }}>
            <h2>{game}</h2>
            {gameProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  borderBottom: "1px dashed purple",
                  paddingBottom: "15px",
                  marginBottom: "15px",
                }}
              >
                <label>Product name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, name: e.target.value }
                          : p
                      )
                    )
                  }
                />
                <label>Ticket price (£)</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, price: parseFloat(e.target.value) }
                          : p
                      )
                    )
                  }
                />
                <label>Active</label>
                <select
                  value={product.active ? "Yes" : "No"}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, active: e.target.value === "Yes" }
                          : p
                      )
                    )
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <button
                  onClick={() => handleSaveProduct(product.id, product)}
                  style={{ marginTop: "10px" }}
                >
                  Save
                </button>
              </div>
            ))}

            {/* Jackpot for this game */}
            <label>Jackpot (£)</label>
            <input
              type="number"
              value={jackpots[game] || 0}
              onChange={(e) =>
                setJackpots((prev) => ({
                  ...prev,
                  [game]: parseFloat(e.target.value),
                }))
              }
            />
            <div style={{ marginBottom: "20px", marginTop: "10px" }}>
              <button onClick={() => handleSaveJackpot(game)}>Save Jackpot</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}