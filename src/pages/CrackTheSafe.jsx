import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../ui/pubgame-theme.css";

const API_BASE =
  (typeof window !== "undefined" && (window._APP_API_BASE || window.APP_API_BASE)) ||
  import.meta?.env?.VITE_APP_API_BASE ||
  process.env?.REACT_APP_API_BASE ||
  "";

function usePubId() {
  const [sp] = useSearchParams();
  const q = sp.get("pubId") || sp.get("pub") || "";
  return q || ""; // string so we can pass through
}

async function fetchInfo(pubId) {
  const url = `${API_BASE}/api/games/crack_safe/info?pubId=${encodeURIComponent(pubId)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { ticket_price: "x.xx", jackpot: "y.yy" }
}

function getSessionCode() {
  const key = "pg_safe_code";
  let v = sessionStorage.getItem(key);
  if (v && /^\d{3}$/.test(v)) return v;
  // generate new 3-digit code; leading zeros allowed
  v = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  sessionStorage.setItem(key, v);
  return v;
}

export default function CrackTheSafe() {
  const pubId = usePubId();
  const [info, setInfo] = useState({ ticket_price: "0.00", jackpot: "0.00" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // local round state
  const [digits, setDigits] = useState(["", "", ""]);
  const [result, setResult] = useState(null); // "win" | "lose" | null
  const [reveal, setReveal] = useState(false);

  const code = useMemo(getSessionCode, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!pubId) { setLoading(false); return; }
      setLoading(true); setErr("");
      try {
        const j = await fetchInfo(pubId);
        if (alive) setInfo(j || {});
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [pubId]);

  const qrHref = `${window.location.origin}/enter/${encodeURIComponent(pubId)}/crack_safe`;

  function submitGuess(e) {
    e.preventDefault();
    const guess = digits.join("");
    if (!/^\d{3}$/.test(guess)) {
      setErr("Enter a 3-digit code");
      return;
    }
    if (guess === code) {
      setResult("win");
    } else {
      setResult("lose");
    }
    setReveal(true);
  }

  function resetRound() {
    setDigits(["", "", ""]);
    // keep same code for the session (rollover behaviour until win)
    setReveal(false);
    setResult(null);
  }

  return (
    <div className="pg-wrap">
      <div className="card max">
        <h1 className="page-title">Crack the Safe</h1>
        {loading && <div className="alert">Loading game info…</div>}
        {err && <div className="alert error">{err}</div>}

        {!loading && (
          <>
            <p style={{ marginTop: 0 }}>
              Ticket: <strong>£{info.ticket_price || "0.00"}</strong> ·
              Current jackpot: <strong>£{info.jackpot || "0.00"}</strong>
            </p>

            <div className="toolbar" style={{ alignItems: "flex-start" }}>
              <div>
                <div style={{ marginBottom: 6, fontWeight: 700 }}>Scan to enter</div>
                <img
                  alt="QR to enter"
                  width={180}
                  height={180}
                  style={{ borderRadius: 16, border: "2px solid #3b1bb8" }}
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrHref)}`}
                />
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 8, wordBreak: "break-all" }}>
                  {qrHref}
                </div>
              </div>

              <form onSubmit={submitGuess} style={{ flex: 1 }}>
                <div className="field">
                  <label>Enter the 3-digit code</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        inputMode="numeric"
                        maxLength={1}
                        placeholder="0"
                        value={d}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
                          setDigits(prev => prev.map((p, idx) => (idx === i ? v : p)));
                        }}
                        style={{ width: 64, textAlign: "center", fontSize: 28 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="toolbar">
                  <button className="btn" type="submit">Try the code</button>
                  <button className="btn ghost" type="button" onClick={resetRound}>Clear</button>
                </div>
              </form>
            </div>

            {reveal && (
              <div className="card" style={{ marginTop: 16 }}>
                {result === "win" ? (
                  <>
                    <h2 className="section-title">Unlocked! 🎉</h2>
                    <p style={{ marginTop: 0 }}>
                      The code <strong>{code}</strong> was correct.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="section-title">Not this time</h2>
                    <p style={{ marginTop: 0 }}>
                      The safe stays locked. Try again next draw.
                    </p>
                  </>
                )}
                <div className="toolbar">
                  <button className="btn" onClick={resetRound}>Play again</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}