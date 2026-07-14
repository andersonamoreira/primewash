"use client";

import { formatCurrency } from "@/lib/format";

export function ChartTooltip({
  active,
  label,
  items,
}: {
  active?: boolean;
  label?: string | number;
  items?: { name: string; value: number; color: string; isCurrency?: boolean }[];
}) {
  if (!active || !items || items.length === 0) return null;

  return (
    <div className="rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto font-semibold text-foreground">
            {item.isCurrency ? formatCurrency(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
