import React from 'react';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  const styles =
    variant === 'outline'
      ? 'border border-base text-foreground'
      : 'bg-accent text-[hsl(var(--accent-foreground))]';
  return (
    <span className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </span>
  );
}