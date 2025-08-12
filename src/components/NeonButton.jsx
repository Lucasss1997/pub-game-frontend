import React from 'react';

export default function NeonButton({ children, kind='primary', as:'button' | 'a', href, ...rest }) {
  const cls = kind==='danger' ? 'btn alt' : kind==='ghost' ? 'btn ghost' : 'btn';
  if (as === 'a' && href) return <a className={cls} href={href} {...rest}>{children}</a>;
  return <button className={cls} {...rest}>{children}</button>;
}