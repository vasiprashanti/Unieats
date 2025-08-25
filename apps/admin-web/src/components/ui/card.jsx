import React from 'react';

export function Card({ className = '', ...props }) {
  return <div className={`rounded-lg border border-base bg-[hsl(var(--card))] ${className}`} {...props} />;
}
export function CardHeader({ className = '', ...props }) {
  return <div className={`p-4 border-b border-base ${className}`} {...props} />;
}
export function CardTitle({ className = '', ...props }) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props} />;
}
export function CardDescription({ className = '', ...props }) {
  return <p className={`text-sm text-muted ${className}`} {...props} />;
}
export function CardContent({ className = '', ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}