"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "@/components/dashboard/charts/chart-tooltip";

const AXIS_COLOR = "var(--muted-foreground)";
const GRID_COLOR = "var(--border-subtle)";
const CURSOR_COLOR = "var(--border-strong)";
const LINE_COLOR = "#3fa8ec";

export function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Sem faturamento registrado neste período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -12 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.25} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="date" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} interval={Math.ceil(data.length / 8)} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={0} />
        <Tooltip
          cursor={{ stroke: CURSOR_COLOR }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label}
              items={payload?.map((p) => ({
                name: "Faturamento",
                value: Number(p.value),
                color: LINE_COLOR,
                isCurrency: true,
              }))}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
