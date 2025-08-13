// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api"; // ✅ use the helper object

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Show the "Ensure user" helper only on localhost or if ?ensure=1 is present.
  const showEnsure =
    window.location.hostname.includes("localhost") ||
    window.location.search.includes("ensure=1");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const res = await api.post("/api/login", { email, password });
      // Expect { token: "..." }
      if (!res?.token) throw new Error("Missing token from server");
      setToken(res.token);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function ensureUserOnce() {
    setMsg("");
    setBusy(true);
    try {
      // Optional dev helper on your backend; ignore if not present.
      await api.post("/api/dev/ensure-user", { email, password });
      setMsg("User ensured. Try logging in again.");
    } catch (err) {
      setMsg(err.message || "Could not ensure user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-wrap" style={{ paddingTop: 24 }}>
      <div className="admin-card" style={{ maxWidth: 520 }}>
        <h1 className="admin-title">Sign In</h1>

        {msg && (
          <div className="alert error" role="alert">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email"><strong>Email</strong></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="you@pub.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password"><strong>Password</strong></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              required
            />
          </div>

          <div className="actions" style={{ justifyContent: "flex-start" }}>
            <button className="btn solid" type="submit" disabled={busy}>
              {busy ? "Logging in…" : "Login"}
            </button>

            {showEnsure && (
              <button
                className="btn ghost"
                type="button"
                onClick={ensureUserOnce}
                disabled={busy}
                title="Dev helper to create/reset the demo user"
              >
                Ensure user (once)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}