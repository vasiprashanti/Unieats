import React from 'react';

export default function TopItemsList({ items }) {
  const maxRevenue = Math.max(...items.map(item => item.revenue));

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-[#ff6600] text-white text-xs font-medium rounded">
            Bestseller
          </span>
          <span className="px-2 py-1 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-medium rounded">
            Top {rank}
          </span>
        </div>
      );
    }
    return (
      <span className="px-2 py-1 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-medium rounded">
        Top {rank}
      </span>
    );
  };

  const getProgressBarWidth = (revenue) => {
    return (revenue / maxRevenue) * 100;
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          {/* Rank Number */}
          <div className="flex-shrink-0 w-8 h-8 bg-[#ff6600] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{item.rank}</span>
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-base font-medium text-[hsl(var(--foreground))]">{item.name}</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item.orders} orders • ₹{item.revenue.toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                {getRankBadge(item.rank)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-[hsl(var(--accent))] rounded-full h-2">
              <div
                className="bg-[#ff6600] h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressBarWidth(item.revenue)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}