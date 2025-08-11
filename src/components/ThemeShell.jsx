import React from 'react';

export default function ThemeShell({ children }) {
  const s = {
    shell: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#0b1220 0%, #0f172a 100%)',
      color: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
    },
    main: { padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' },
  };
  return (
    <div style={s.shell}>
      <main style={s.main}>{children}</main>
    </div>
  );
}