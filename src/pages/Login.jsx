// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post, setToken } from "../lib/api"; // <-- matches the new api helper

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("new@pub.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setNote("");
    setLoading(true);
    try {
      const data = await post("/api/login", { email, password });
      if (!data?.token) throw new Error("No token returned");
      setToken(data.token); // stores & sets header
      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  // Optional helper you had earlier
  async function handleEnsureUser() {
    setErr("");
    setNote("");
    setLoading(true);
    try {
      await post("/api/admin/ensure-user", { email });
      setNote("User ensured. Try logging in again.");
    } catch (e2) {
      setErr(e2?.message || "Could not ensure user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="card">
        <h1 className="title">Sign In</h1>

        {err ? <div className="alert error">{err}</div> : null}
        {note ? <div className="alert diag">{note}</div> : null}

        <form onSubmit={handleLogin} className="form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="actions">
            <button className="btn solid" disabled={loading} type="submit">
              {loading ? "Logging in…" : "Login"}
            </button>

            {/* Keep this if you use the one-click seed/ensure flow */}
            <button
              className="btn ghost"
              type="button"
              onClick={handleEnsureUser}
              disabled={loading}
            >
              Ensure user (once)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}