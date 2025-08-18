// Single source of truth for environment values (no import.meta).

const clean = (s) => (s || "").trim().replace(/\/+$/, "");

// Build-time vars (optional)
const RAW_API = clean(process.env.REACT_APP_API_BASE);
const RAW_WS  = clean(process.env.REACT_APP_WS_BASE);

// Try to guess the backend from the current host if not provided.
// Works for Render: pub-game-frontend.onrender.com -> pub-game-backend.onrender.com
function guessApiFromHost() {
  try {
    const { origin, hostname } = window.location;
    if (/frontend/i.test(hostname)) return origin.replace(/frontend/gi, "backend");
    // fallback to same-origin (only if you proxy /api)
    return origin;
  } catch {
    return "";
  }
}

export const API_BASE = RAW_API || guessApiFromHost();
export const WS_BASE  = RAW_WS  || (API_BASE ? API_BASE.replace(/^http/i, "ws") : "");

// keep default export for legacy imports
export default { API_BASE, WS_BASE };