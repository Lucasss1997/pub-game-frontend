import React from 'react';

export default function NeonButton(props) {
  const { children, kind, ...rest } = props;
  let cls = 'btn';
  if (kind === 'danger') cls = 'btn alt';
  else if (kind === 'ghost') cls = 'btn ghost';

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}