import React, { createContext, useContext, useState } from 'react';

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value: controlled, onValueChange, className = '', children }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = onValueChange ?? setInternal;
  return (
    <TabsCtx.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className = '', ...props }) {
  return (
    <div className={`inline-flex gap-2 rounded-md bg-[hsl(var(--secondary))] p-1 ${className}`} {...props} />
  );
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  const base = 'px-3 py-1.5 text-sm rounded-md transition-colors';
  const styles = active
    ? 'bg-[hsl(var(--card))] border border-base text-foreground'
    : 'text-muted hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]';
  return (
    <button
      type="button"
      className={`${base} ${styles} ${className}`}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.value !== value) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}