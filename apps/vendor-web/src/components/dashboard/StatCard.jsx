import React from "react";

// Simple stat card used on vendor dashboard
export default function StatCard({ title, value, icon = null, subtitle = null }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}