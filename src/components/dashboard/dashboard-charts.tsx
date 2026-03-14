"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── Detect dark mode via class on <html> ── */
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

/* ────── Revenue vs Expenses Area Chart ────── */

interface MonthlyDataPoint {
  month: string;
  monthFull: string;
  revenue: number;
  expenses: number;
  netIncome: number;
}

interface RevenueExpenseChartProps {
  data: MonthlyDataPoint[];
}

const CHART_COLORS = {
  revenue: "#10b981",   // emerald-500
  expenses: "#f43f5e",  // rose-500
  grid: "#f3f4f6",      // gray-100
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `Q${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Q${(value / 1_000).toFixed(1)}K`;
  return `Q${value.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold mb-1">{payload[0]?.payload?.monthFull || label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === "revenue" ? "Ingresos" : "Gastos"}:
          </span>
          <span className="font-medium">{formatCompact(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#27272a" : "#f3f4f6";
  const tickColor = isDark ? "#71717a" : "#9ca3af";

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS.revenue}
          strokeWidth={2}
          fill="url(#colorRevenue)"
          name="Ingresos"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke={CHART_COLORS.expenses}
          strokeWidth={2}
          fill="url(#colorExpenses)"
          name="Gastos"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ────── Expense Category Donut Chart ────── */

interface ExpenseCategorySlice {
  name: string;
  value: number;
}

interface ExpenseCategoryChartProps {
  data: ExpenseCategorySlice[];
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#3b82f6", "#8b5cf6"];

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-muted-foreground">{formatCompact(payload[0].value)}</p>
    </div>
  );
}

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        Sin gastos registrados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
