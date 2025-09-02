import React from "react";

// Simple stat card used on vendor dashboard
export default function StatCard({ title, value, icon = null, subtitle = null }) {
  return (
    <div className="rounded-xl border border-base bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}