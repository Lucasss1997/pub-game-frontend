// src/pages/Enter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../ui/pubgame-theme.css";

/**
 * Public entry page for players from QR:
 * Route: /enter/:pubId/:gameKey
 *
 * Shows ticket price & current jackpot pulled from backend public info endpoint:
 *   GET /api/games/:gameKey/info?pubId=...
 *
 * Collects a mobile number (UK-friendly validation), creates a local
 * proof-of-entry code that the player can show to staff at the bar.
 *
 * Later, when Stripe is wired, you can set FRONTEND_PAY_URL or similar to send
 * the user to a hosted checkout after they submit mobile.
 */

const API_BASE =
  (typeof window !== "undefined" && (window._APP_API_BASE || window.APP_API_BASE)) ||
  import.meta?.env?.VITE_APP_API_BASE ||
  process.env?.REACT_APP_API_BASE ||
  "";

// Optional: if you want to bounce to a hosted checkout later, set this at build time
const CHECKOUT_URL =
  (typeof window !== "undefined" && window._APP_CHECKOUT_URL) ||
  import.meta?.env?.VITE_CHECKOUT_URL ||
  process.env?.REACT_APP_CHECKOUT_URL ||
  ""; // e.g. "https://pay.example.com/checkout?pubId={PUB}&gameKey={GAME}&mobile={MOBILE}"

async function fetchInfo(gameKey, pubId) {
  const url = `${API_BASE}/api/games/${encodeURIComponent(gameKey)}/info?pubId=${encodeURIComponent(
    pubId
  )}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { ticket_price: "x.xx", jackpot: "y.yy" }
}

function normalizeUkMobile(input) {
  if (!input) return "";
  let s = String(input).trim().replace(/\s+/g, "");
  // Convert +44XXXX to 0XXXX
  if (s.startsWith("+44")) s = "0" + s.slice(3);
  // Strip non-digits
  s = s.replace(/[^\d]/g, "");
  return s;
}

function isLikelyUkMobile(input) {
  const s = normalizeUkMobile(input);
  // Simple UK mobile check: 11 digits and starts with 07
  return /^07\d{9}$/.test(s);
}

function makeEntryCode(pubId, gameKey) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  // include a tiny checksum bit for fun
  const sum =
    String(pubId).split("").reduce((a, c) => a + (c.charCodeAt(0) % 10), 0) +
    String(gameKey).split("").reduce((a, c) => a + (c.charCodeAt(0) % 10), 0);
  return `${out}-${(sum % 9) + 1}`;
}

export default function Enter() {
  const { pubId = "", gameKey = "" } = useParams();
  const nav = useNavigate();

  const [info, setInfo] = useState({ ticket_price: "0.00", jackpot: "0.00" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [mobile, setMobile] = useState("");
  const [touched, setTouched] = useState(false);
  const mobileOk = isLikelyUkMobile(mobile);

  const [submitted, setSubmitted] = useState(false);
  const entryCode = useMemo(() => makeEntryCode(pubId, gameKey), [pubId, gameKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const j = await fetchInfo(gameKey, pubId);
        if (alive) setInfo(j || {});
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [gameKey, pubId]);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!mobileOk) return;

    // Save a tiny receipt locally so player can re-open if needed
    try {
      const receipt = {
        ts: Date.now(),
        pubId,
        gameKey,
        mobile: normalizeUkMobile(mobile),
        code: entryCode
      };
      const key = `pg_receipt_${pubId}_${gameKey}`;
      localStorage.setItem(key, JSON.stringify(receipt));
    } catch {}

    // If you later wire a hosted checkout, bounce there first
    if (CHECKOUT_URL) {
      const qs = CHECKOUT_URL
        .replace("{PUB}", encodeURIComponent(pubId))
        .replace("{GAME}", encodeURIComponent(gameKey))
        .replace("{MOBILE}", encodeURIComponent(normalizeUkMobile(mobile)));
      window.location.assign(qs);
      return;
    }

    // Otherwise show the “Show this to staff” success panel
    setSubmitted(true);
  }

  const friendlyGame =
    gameKey === "crack_safe"
      ? "Crack the Safe"
      : gameKey === "whats_in_the_box"
      ? "What’s in the Box"
      : gameKey.replace(/_/g, " ");

  const qrBackToGame = `${window.location.origin}/${gameKey === "crack_safe" ? "crack-the-safe" : "whats-in-the-box"}?pubId=${encodeURIComponent(pubId)}`;

  return (
    <div className="pg-wrap">
      <div className="card max">
        <h1 className="page-title">Enter – {friendlyGame}</h1>

        {loading && <div className="alert">Loading game info…</div>}
        {err && <div className="alert error">{err}</div>}

        {!loading && !submitted && (
          <>
            <p style={{ marginTop: 0 }}>
              Ticket: <strong>£{info.ticket_price || "0.00"}</strong> · Current jackpot:{" "}
              <strong>£{info.jackpot || "0.00"}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Mobile number</label>
                <input
                  inputMode="numeric"
                  placeholder="07XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onBlur={() => setTouched(true)}
                />
                {touched && !mobileOk && (
                  <div className="alert error" style={{ marginTop: 8 }}>
                    Please enter a valid UK mobile (e.g. 07XXXXXXXXX or +447XXXXXXXXX).
                  </div>
                )}
              </div>

              <div className="toolbar">
                <button className="btn" type="submit" disabled={!mobileOk}>
                  Continue
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => nav(`/${gameKey === "crack_safe" ? "crack-the-safe" : "whats-in-the-box"}?pubId=${encodeURIComponent(pubId)}`)}
                >
                  Back to game
                </button>
              </div>
            </form>

            {/* QR back to the game screen if needed */}
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-title" style={{ marginBottom: 8 }}>Scan to view the game screen</h2>
              <img
                alt="QR back to game screen"
                width={180}
                height={180}
                style={{ borderRadius: 16, border: "2px solid #3b1bb8" }}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrBackToGame)}`}
              />
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 8, wordBreak: "break-all" }}>
                {qrBackToGame}
              </div>
            </div>
          </>
        )}

        {!loading && submitted && (
          <div className="card" style={{ marginTop: 10 }}>
            <h2 className="section-title">You’re in! 🎟️</h2>
            <p style={{ marginTop: 0 }}>
              Show this code to staff to confirm your entry. Good luck!
            </p>

            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 2,
                background: "#f8c946",
                border: "2px solid #3b1bb8",
                borderRadius: 16,
                padding: "12px 16px",
                display: "inline-block"
              }}
            >
              {entryCode}
            </div>

            <div className="toolbar" style={{ marginTop: 12 }}>
              <button
                className="btn light"
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(entryCode);
                  } catch {}
                }}
              >
                Copy code
              </button>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  nav(
                    `/${gameKey === "crack_safe" ? "crack-the-safe" : "whats-in-the-box"}?pubId=${encodeURIComponent(
                      pubId
                    )}`
                  )
                }
              >
                Back to game
              </button>
            </div>

            <p style={{ marginTop: 12, opacity: 0.9 }}>
              Ticket: <strong>£{info.ticket_price || "0.00"}</strong> · Current jackpot:{" "}
              <strong>£{info.jackpot || "0.00"}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}