import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`mt-1 w-full rounded border px-2 py-1 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] ${className}`}
      {...props}
    />
  );
}