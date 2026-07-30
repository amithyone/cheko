import React from "react";

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  const isLow = stock <= 10;

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`font-bold ${isLow ? "text-rose-600 animate-pulse" : "text-slate-800"}`}
      >
        {stock} units
      </span>
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isLow ? "bg-rose-500" : "bg-primary"}`}
          style={{ width: `${Math.min(100, (stock / 120) * 100)}%` }}
        />
      </div>
    </div>
  );
}
