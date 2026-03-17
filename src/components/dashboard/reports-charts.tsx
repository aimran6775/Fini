"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    setDark(root.classList.contains("dark"));
    const obs = new MutationObserver(() => setDark(root.classList.contains("dark")));
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

interface MonthlyDataPoint {
  month: string;
  monthFull: string;
  revenue: number;
  expenses: number;
  netIncome: number;
}

interface ReportsBarChartProps {
  data: MonthlyDataPoint[];
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `Q${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Q${(value / 1_000).toFixed(1)}K`;
  return `Q${value.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const LABELS: Record<string, string> = {
    revenue: "Ingresos",
    expenses: "Gastos",
    netIncome: "Utilidad",
  };
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold mb-1">{payload[0]?.payload?.monthFull || label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{LABELS[entry.dataKey] || entry.dataKey}:</span>
          <span className="font-medium">{formatCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ReportsBarChart({ data }: ReportsBarChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#27272a" : "#f3f4f6";
  const tickColor = isDark ? "#71717a" : "#9ca3af";

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
        Sin datos para mostrar gráfico
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: tickColor }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: tickColor }}
          tickFormatter={formatCompact}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => {
            const map: Record<string, string> = { revenue: "Ingresos", expenses: "Gastos", netIncome: "Utilidad" };
            return <span className="text-xs text-muted-foreground">{map[value] || value}</span>;
          }}
        />
        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="revenue" />
        <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="expenses" />
        <Bar dataKey="netIncome" fill="#2563eb" radius={[4, 4, 0, 0]} name="netIncome" />
      </BarChart>
    </ResponsiveContainer>
  );
}
