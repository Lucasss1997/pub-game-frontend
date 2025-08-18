// src/pages/Admin.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminConfig, saveJackpot } from "../lib/api";
import "../ui/pubgame-theme.css";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [cfg, setCfg] = useState(null);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await getAdminConfig();
      setCfg(data || {});
    } catch (e) {
      setErr(String(e.message || e));
      setCfg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const [ctsJackpot, setCtsJackpot]   = useState("0");
  const [wibJackpot, setWibJackpot]   = useState("0");
  useEffect(() => {
    if (cfg?.jackpots) {
      if (cfg.jackpots.crack_the_safe != null)
        setCtsJackpot((cfg.jackpots.crack_the_safe / 100).toFixed(2));
      if (cfg.jackpots.whats_in_the_box != null)
        setWibJackpot((cfg.jackpots.whats_in_the_box / 100).toFixed(2));
    }
  }, [cfg]);

  const saveJackpotClick = async (gameKey, pounds) => {
    try {
      await saveJackpot(gameKey, pounds);
      await load();
      alert("Saved");
    } catch (e) {
      alert("Save failed: " + String(e.message || e));
    }
  };

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <div className="actions" style={{justifyContent:"space-between", flexWrap:"wrap"}}>
          <Link to="/dashboard" className="btn ghost">Back to Dashboard</Link>
          <Link to="/game/new" className="btn ghost">New Game</Link>
          <Link to="/billing" className="btn ghost">Billing</Link>
          <Link to="/login" className="btn solid">Logout</Link>
        </div>

        <h1 className="admin-title">Admin</h1>
        {err && <div className="alert error">{err}</div>}
        {loading && <p>Loading…</p>}

        {!loading && (
          <>
            {/* Crack the Safe */}
            <section className="admin-card" style={{marginTop:12}}>
              <h2 className="section-title">Crack the Safe</h2>

              <div className="field">
                <span>Jackpot (£)</span>
                <input
                  inputMode="decimal"
                  value={ctsJackpot}
                  onChange={(e) => setCtsJackpot(e.target.value)}
                />
              </div>
              <div className="actions">
                <button
                  className="btn solid"
                  onClick={() => saveJackpotClick("crack_the_safe", ctsJackpot)}
                >
                  Save jackpot
                </button>
              </div>
            </section>

            {/* What's in the Box */}
            <section className="admin-card">
              <h2 className="section-title">What’s in the Box</h2>

              <div className="field">
                <span>Jackpot (£)</span>
                <input
                  inputMode="decimal"
                  value={wibJackpot}
                  onChange={(e) => setWibJackpot(e.target.value)}
                />
              </div>
              <div className="actions">
                <button
                  className="btn solid"
                  onClick={() => saveJackpotClick("whats_in_the_box", wibJackpot)}
                >
                  Save jackpot
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}