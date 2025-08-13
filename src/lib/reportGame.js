// src/lib/reportGame.js
//
// Call the backend endpoint that emails a post-game breakdown.
// Works whether you use the project's api helper or plain fetch.
//
// Usage:
//   import { reportGameComplete } from '../lib/reportGame';
//   await reportGameComplete({
//     gameKey: 'crack_the_safe',
//     ticketsSold: 27,
//     ticketPriceCents: 200,
//     jackpotCents: 5400,
//     winner: false,
//     winningCode: null,     // or a string like '123' when there is a winner
//     emailTo: undefined     // optional; defaults to the logged-in user's email
//   });

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env._APP_API_BASE) ||
  (typeof window !== 'undefined' ? `${window.location.origin}` : '');

/**
 * Sends the game-complete payload to the backend.
 * Returns { ok: true } on success, otherwise throws an Error.
 */
export async function reportGameComplete({
  gameKey,
  ticketsSold = 0,
  ticketPriceCents = 0,
  jackpotCents = 0,
  winner = false,
  winningCode = null,
  emailTo // optional
}) {
  if (!gameKey) {
    throw new Error('reportGameComplete: gameKey is required');
  }

  const url = `${API_BASE}/api/games/${encodeURIComponent(gameKey)}/complete`;

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tickets_sold: Number(ticketsSold) || 0,
      ticket_price_cents: Number(ticketPriceCents) || 0,
      jackpot_cents: Number(jackpotCents) || 0,
      winner: !!winner,
      winning_code: winningCode || null,
      email_to: emailTo || undefined
    })
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg += ` · ${JSON.stringify(data)}`;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json(); // { ok: true }
}