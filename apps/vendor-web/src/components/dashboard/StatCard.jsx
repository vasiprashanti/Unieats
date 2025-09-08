import React from "react";

// Enhanced stat card with modern visual improvements
export default function StatCard({ title, value, icon = null, subtitle = null }) {
  return (
    <div className="group rounded-2xl border border-base bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[hsl(var(--primary))] group-hover:scale-105 transition-transform duration-200">{value}</p>
          {subtitle ? (
            <p className="mt-2 text-xs text-muted opacity-80 group-hover:opacity-100 transition-opacity duration-200">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))] shadow-md group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}