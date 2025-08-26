import React, { Suspense } from "react";

// Lazy-load Recharts to keep initial bundle smaller
const {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} = {
  ResponsiveContainer: React.lazy(() => import("recharts").then(m => ({ default: m.ResponsiveContainer }))),
  LineChart: React.lazy(() => import("recharts").then(m => ({ default: m.LineChart }))),
  Line: React.lazy(() => import("recharts").then(m => ({ default: m.Line }))),
  XAxis: React.lazy(() => import("recharts").then(m => ({ default: m.XAxis }))),
  YAxis: React.lazy(() => import("recharts").then(m => ({ default: m.YAxis }))),
  Tooltip: React.lazy(() => import("recharts").then(m => ({ default: m.Tooltip }))),
  CartesianGrid: React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid }))),
  BarChart: React.lazy(() => import("recharts").then(m => ({ default: m.BarChart }))),
  Bar: React.lazy(() => import("recharts").then(m => ({ default: m.Bar }))),
};

/**
 * Chart
 * A simple wrapper that can render either a line or bar chart with a shared container.
 * Props:
 * - type: 'line' | 'bar'
 * - data: array of objects [{ label, value }]
 * - xKey: key for x axis (default: 'label')
 * - yKey: key for y axis (default: 'value')
 * - title: optional section title
 */
export default function Chart({ type = 'line', data = [], xKey = 'label', yKey = 'value', title }) {
  return (
    <div className="rounded-lg border border-base p-4">
      {title && <h3 className="font-medium mb-3">{title}</h3>}
      <div style={{ width: '100%', height: 280 }}>
        <Suspense fallback={<div className="text-sm text-muted">Loading chart…</div>}>
          <ResponsiveContainer>
            {type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={yKey} fill="#F97316" />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={yKey} stroke="#F97316" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Suspense>
      </div>
    </div>
  );
}