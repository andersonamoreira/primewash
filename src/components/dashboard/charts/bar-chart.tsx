"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartTooltip } from "@/components/dashboard/charts/chart-tooltip";

const AXIS_COLOR = "var(--muted-foreground)";
const GRID_COLOR = "var(--border-subtle)";
const CURSOR_FILL = "color-mix(in srgb, var(--foreground) 6%, transparent)";
const BAR_COLOR = "#3fa8ec";

export function SimpleBarChart({
  data,
  orientation = "vertical",
  height = 260,
}: {
  data: { name: string; count: number }[];
  orientation?: "vertical" | "horizontal";
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Sem dados suficientes neste período.
      </div>
    );
  }

  if (orientation === "horizontal") {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke={AXIS_COLOR}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip
            cursor={{ fill: CURSOR_FILL }}
            content={({ active, label, payload }) => (
              <ChartTooltip
                active={active}
                label={label}
                items={payload?.map((p) => ({
                  name: "Quantidade",
                  value: Number(p.value),
                  color: BAR_COLOR,
                }))}
              />
            )}
          />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -12 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: CURSOR_FILL }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label}
              items={payload?.map((p) => ({
                name: "Quantidade",
                value: Number(p.value),
                color: BAR_COLOR,
              }))}
            />
          )}
        />
        <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
