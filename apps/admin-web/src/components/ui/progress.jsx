import React from 'react';

export function Progress({ value = 0, className = '', ...props }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`w-full h-2 bg-[hsl(var(--secondary))] rounded ${className}`} {...props}>
      <div
        className="h-full rounded bg-[hsl(var(--primary))]"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}