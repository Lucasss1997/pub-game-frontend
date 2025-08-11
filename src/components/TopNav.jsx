import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function Billing() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const s = styles();

  const onBack = () => {
    nav('/dashboard');
  };

  const onRenew = () => {
    setLoading(true);
    // Placeholder for future Stripe integration
    setTimeout(() => {
      alert('Subscription renewed successfully!');
      nav('/dashboard');
    }, 1500);
  };

  return (
    <div style={s.appShell}>
      <TopNav title="Billing" hideLogout={false} rightSlot={<button style={s.button} onClick={onBack}>Back</button>} />
      <main style={s.main}>
        <h1 style={s.title}>Subscription Billing</h1>
        <p style={s.text}>Your subscription is about to expire or has expired. Renew now to continue accessing all features.</p>
        <div style={s.actions}>
          <button style={{ ...s.button, ...s.buttonPrimary }} onClick={onRenew} disabled={loading}>
            {loading ? 'Processing…' : 'Renew Now'}
          </button>
        </div>
      </main>
    </div>
  );
}

function styles() {
  return {
    appShell: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0b1220 0%, #0f172a 100%)',
      color: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    main: {
      padding: 20,
      maxWidth: 600,
      margin: '0 auto',
      textAlign: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 16,
    },
    text: {
      fontSize: 16,
      color: '#94a3b8',
      marginBottom: 24,
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 10,
    },
    button: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e5e7eb',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '8px 16px',
      borderRadius: 10,
      cursor: 'pointer',
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      border: 'none',
      color: '#0b1220',
      fontWeight: 700,
    },
  };
}
