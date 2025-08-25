import React from 'react';

export function Button({ className = '', variant = 'default', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center rounded px-3 py-1.5 disabled:opacity-60';
  const map = {
    default: 'border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]',
    outline: 'border',
    primary: 'bg-orange-500 text-white',
  };
  const cls = `${base} ${map[variant] || map.default} ${className}`;
  return <button className={cls} disabled={disabled} {...props} />;
}