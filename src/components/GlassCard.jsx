import React from 'react';

export default function GlassCard({ tone='default', title, subtitle, children }) {
  const cls = `card ${tone}`;
  return (
    <section className={cls}>
      {title && <h2>{title}</h2>}
      {subtitle && <small>{subtitle}</small>}
      {children}
    </section>
  );
}