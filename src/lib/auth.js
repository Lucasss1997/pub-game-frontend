// server/middleware/auth.js
// Drop this file in your backend project and use `requireAuth` on protected routes.

const jwt = require("jsonwebtoken");

function getTokenFromReq(req) {
  // Prefer Authorization header: "Bearer <token>"
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && typeof auth === "string") {
    const parts = auth.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
  }

  // Fallbacks if you ever send via cookie or query (optional)
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.query && req.query.t) return req.query.t;

  return null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Fail loudly in dev if secret is missing
      console.error("[auth] Missing JWT_SECRET env");
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    const decoded = jwt.verify(token, secret);
    // Example decoded shape: { id, pub_id, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth };