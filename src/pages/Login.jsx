// src/pages/Login.jsx
import React, { useState } from "react";
import api, { setToken } from "../lib/api";
import "../ui/pubgame-theme.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await api.post("/api/login", { email, password });
      // backend returns { token } and also sets cookie; store token for headers
      if (data?.token) setToken(data.token);
      window.location.replace("/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="page page-center">
      <div className="card">
        <h1 className="title">Sign In</h1>

        {err && <div className="alert error">{err}</div>}

        <form onSubmit={onSubmit} className="vstack gap-3">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn solid">Login</button>
        </form>
      </div>
    </div>
  );
}