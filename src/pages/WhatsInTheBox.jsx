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
  return q || "";
}

async function fetchInfo(pubId) {
  const url = `${API_BASE}/api/games/whats_in_the_box/info?pubId=${encodeURIComponent(pubId)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { ticket_price: "x.xx", jackpot: "y.yy" }
}

function getWinningBoxIndex() {
  const key = "pg_box_win_index";
  const v = sessionStorage.getItem(key);
  if (v !== null && !Number.isNaN(Number(v))) return Number(v);
  const n = Math.floor(Math.random() * 3); // 0..2
  sessionStorage.setItem(key, String(n));
  return n;
}

export default function WhatsInTheBox() {
  const pubId = usePubId();
  const [info, setInfo] = useState({ ticket_price: "0.00", jackpot: "0.00" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [opened, setOpened] = useState(-1); // index opened
  const winIdx = useMemo(getWinningBoxIndex, []);

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

  const qrHref = `${window.location.origin}/enter/${encodeURIComponent(pubId)}/whats_in_the_box`;

  function pick(i) {
    if (opened >= 0) return;
    setOpened(i);
  }

  function reset() {
    setOpened(-1);
    // keep same winning index during the session (rollover)
  }

  return (
    <div className="pg-wrap">
      <div className="card max">
        <h1 className="page-title">What’s in the Box</h1>
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

              {/* Boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, flex: 1 }}>
                {[0, 1, 2].map((i) => {
                  const isOpen = opened === i;
                  const isWin = i === winIdx;
                  return (
                    <button
                      key={i}
                      className="btn"
                      onClick={() => pick(i)}
                      style={{
                        height: 140,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 18,
                        background: isOpen ? (isWin ? "#22c55e" : "#ef4444") : undefined,
                      }}
                    >
                      {isOpen ? (isWin ? "🎉 Winner!" : "🙃 Empty") : `Box ${i + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {opened >= 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                {opened === winIdx ? (
                  <>
                    <h2 className="section-title">Winner! 🎉</h2>
                    <p style={{ marginTop: 0 }}>
                      You picked the winning box. Speak to the team to claim your prize.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="section-title">Not this time</h2>
                    <p style={{ marginTop: 0 }}>
                      The prize was in <strong>Box {winIdx + 1}</strong>. Better luck next time!
                    </p>
                  </>
                )}
                <div className="toolbar">
                  <button className="btn" onClick={reset}>Play again</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}