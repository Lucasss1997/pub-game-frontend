// src/pages/Billing.jsx
// Simple placeholder billing page with plan info + renew action.
// Wire this route in App.jsx as: <Route path="/billing" element={<Billing/>} />

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function Billing() {
  const nav = useNavigate();
  const [processing, setProcessing] = useState(false);

  // Pretend we read this from /api/dashboard or /api/billing
  const plan = useMemo(() => ({
    name: 'Pub Game Pro',
    price: 19.99,
    currency: 'GBP',
    interval: 'month',
  }), []);

  const onPay = async () => {
    try {
      setProcessing(true);
      // In a real app, call your backend to create a checkout session
      // const { checkoutUrl } = await api.post('/api/billing/checkout', { plan: 'pro-monthly' });
      // window.location.href = checkoutUrl;
      // For now, simulate success and return to dashboard
      await new Promise(r => setTimeout(r, 1200));
      nav('/dashboard', { replace: true });
    } finally {
      setProcessing(false);
    }
  };

  const s = styles();

  return (
    <div style={s.appShell}>
      <TopNav title="Billing" hideLogout={false} rightSlot={null} />

      <main style={s.main}>
        <section style={s.card}>
          <h1 style={s.title}>Subscription</h1>
          <p style={s.sub}>Keep your pub games active and receive updates automatically.</p>

          <div style={s.planRow}>
            <div>
              <div style={s.planName}>{plan.name}</div>
              <div style={s.planMeta}>Billed per {plan.interval}</div>
            </div>
            <div style={s.price}>
              <span style={s.amount}>£{plan.price.toFixed(2)}</span>
              <span style={s.per}>/ {plan.interval}</span>
            </div>
          </div>

          <div style={s.actions}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={onPay} disabled={processing}>
              {processing ? 'Processing…' : 'Renew now'}
            </button>
            <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => nav('/dashboard')}>Back to dashboard</button>
          </div>
        </section>

        <section style={s.card}>
          <h2 style={s.h2}>Invoices</h2>
          <p style={s.sub}>Invoices will appear here after you integrate payments.</p>
        </section>
      </main>

      <footer style={s.footer}>© {new Date().getFullYear()} Pub Game</footer>
    </div>
  );
}

function styles() {
  const shadow = '0 10px 20px rgba(0,0,0,0.08), 0 6px 6px rgba(0,0,0,0.05)';
  const border = '1px solid rgba(255,255,255,0.08)';
  return {
    appShell: { minHeight: '100vh', background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 100%)', color: '#e5e7eb', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', display: 'grid', gridTemplateRows: 'auto 1fr auto' },
    main: { padding: 20, maxWidth: 900, margin: '0 auto', width: '100%', display: 'grid', gap: 16 },
    card: { background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border, borderRadius: 20, boxShadow: shadow, padding: 20 },
    title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' },
    h2: { margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#fff' },
    sub: { margin: '6px 0 16px 0', color: '#94a3b8' },
    planRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: border, borderBottom: border, margin: '8px 0' },
    planName: { fontSize: 16, fontWeight: 700, color: '#e5e7eb' },
    planMeta: { fontSize: 12, color: '#94a3b8' },
    price: { display: 'flex', alignItems: 'baseline', gap: 6 },
    amount: { fontSize: 24, fontWeight: 900, color: '#fff' },
    per: { fontSize: 12, color: '#94a3b8' },
    actions: { display: 'flex', gap: 10, marginTop: 12 },
    btn: { background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: 12, cursor: 'pointer' },
    btnPrimary: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#0b1220', fontWeight: 800 },
    btnGhost: { background: 'transparent' },
    footer: { padding: 14, textAlign: 'center', color: '#64748b', borderTop: border, background: 'rgba(15, 23, 42, 0.7)' },
  };
}
