// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/env";
import "../ui/pubgame-theme.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("new@pub.com");
  const [password, setPassword] = useState("password");
  const [msg, setMsg] = useState("");

  const apiURL = (p) => {
    const base = (API_BASE || "").replace(/\/+$/, "");
    return base + p;
  };

  async function login(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(apiURL("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      const token = data?.token;
      if (!token) throw new Error("No token returned");
      localStorage.setItem("token", token);
      nav("/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setMsg(err?.message || "Login failed");
    }
  }

  async function ensureUserOnce() {
    setMsg("");
    const payload = { email, password };
    try {
      // Try /api/ensure-user then /api/admin/ensure-user
      let res = await fetch(apiURL("/api/ensure-user"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(apiURL("/api/admin/ensure-user"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      setMsg("User ensured. Now press Login.");
    } catch (err) {
      console.error("ENSURE USER ERROR:", err);
      setMsg(err?.message || "Ensure user failed");
    }
  }

  return (
    <div className="pg-container">
      <div className="pg-card">
        <h1 className="pg-title">Sign In</h1>

        {msg ? <div className="pg-alert pg-alert-error">{msg}</div> : null}

        <form onSubmit={login}>
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
            <button className="pg-btn" type="button" onClick={ensureUserOnce}>
              Ensure user (once)
            </button>
          </div>
        </form>

        {/* Tiny debug line — shows which API base we’re posting to */}
        <div style={{ opacity: 0.6, fontSize: 12, marginTop: 8 }}>
          API: {API_BASE || "(not set)"}
        </div>
      </div>
    </div>
  );
}