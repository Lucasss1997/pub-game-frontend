import React, { useState } from 'react';
import { api } from '../lib/api';
import '../ui/pubgame-theme.css';

export default function Billing() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setErr('');
    try {
      setBusy(true);
      const d = await api.post('/api/billing/portal', {}); // expects { url }
      if (!d?.url) throw new Error('Portal URL not returned');
      window.location.href = d.url; // redirect without using restricted 'location' identifier
    } catch (e) {
      setErr(e.message || 'Unable to open billing portal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pg-wrap">
      <div className="pg-grid" style={{ maxWidth: 900 }}>
        <section className="pg-card purple">
          <h2>Billing</h2>
          <small>Manage your subscription and invoices in Stripe.</small>

          {err && <div className="pg-bad">{err}</div>}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="pg-btn" onClick={openPortal} disabled={busy}>
              {busy ? 'Opening…' : 'Open Customer Portal'}
            </button>
            <a className="pg-btn ghost" href="/dashboard">Back to Dashboard</a>
          </div>
        </section>
      </div>
    </div>
  );
}