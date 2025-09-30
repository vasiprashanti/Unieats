import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
        <p className="text-sm text-[#ff6600]">
          ₹{payload[0].value.toLocaleString()} Revenue
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }) {
  const [colors, setColors] = useState({
    text: '#64748b',
    grid: '#e2e8f0'
  });

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setColors({
        text: isDark ? '#94a3b8' : '#64748b', // Using appropriate muted foreground colors
        grid: isDark ? '#334155' : '#e2e8f0'  // Using appropriate border colors
      });
    };
    
    updateColors();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const minRevenue = Math.min(...data.map(item => item.revenue));
  const yAxisMin = Math.max(0, minRevenue - (maxRevenue - minRevenue) * 0.1);
  const yAxisMax = maxRevenue + (maxRevenue - minRevenue) * 0.1;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: colors.text }}
          />
          <YAxis
            domain={[yAxisMin, yAxisMax]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: colors.text }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ff6600"
            strokeWidth={3}
            dot={{ fill: '#ff6600', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: '#ff6600', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}