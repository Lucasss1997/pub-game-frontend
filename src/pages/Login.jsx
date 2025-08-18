// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../lib/api";
import "../ui/pubgame-theme.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("new@pub.com");
  const [password, setPassword] = useState("password");
  const [banner, setBanner] = useState("");

  // Soft health check (non-blocking)
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        await api.get("/healthz");
      } catch (e) {
        if (!on) return;
        // show a small warning but do not block login
        setBanner("Load failed");
        setTimeout(() => setBanner(""), 3000);
        console.warn("Health check failed:", e?.message || e);
      }
    })();
    return () => { on = false; };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setBanner("");
    try {
      const res = await api.post("/api/login", { email, password });
      // expect { token: "..." }
      if (res && res.token) {
        setToken(res.token);
        nav("/dashboard", { replace: true });
      } else {
        throw new Error("No token returned");
      }
    } catch (err) {
      setBanner(err?.message || "Login failed");
    }
  }

  // One-time seeding helper (tries two possible endpoints)
  async function ensureUserOnce() {
    setBanner("");
    try {
      await api.post("/api/ensure-user", { email, password });
      setBanner("User ensured");
    } catch (e1) {
      try {
        await api.post("/api/admin/ensure-user", { email, password });
        setBanner("User ensured");
      } catch (e2) {
        setBanner(e2?.message || e1?.message || "Ensure user failed");
      }
    }
    setTimeout(() => setBanner(""), 3000);
  }

  return (
    <div className="pg-container">
      <div className="pg-card">
        <h1 className="pg-title">Sign In</h1>

        {banner && <div className="pg-alert pg-alert-error">{banner}</div>}

        <form onSubmit={handleLogin}>
          <label className="pg-label">Email</label>
          <input
            className="pg-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <label className="pg-label">Password</label>
          <input
            className="pg-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="pg-actions">
            <button className="pg-btn pg-btn-primary" type="submit">
              Login
            </button>
            <button
              className="pg-btn"
              type="button"
              onClick={ensureUserOnce}
              title="Create the user if it doesn't exist"
            >
              Ensure User (once)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}