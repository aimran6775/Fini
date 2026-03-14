"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";

const periods = [
  { value: "month", label: "Este Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Este Año" },
  { value: "all", label: "Todo" },
] as const;

export function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") || "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("period");
    } else {
      params.set("period", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground ml-1.5" />
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => handleChange(p.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            current === p.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/** Returns { start, end } ISO date strings based on period name */
export function getPeriodRange(period: string | null): { start: string | null; end: string | null } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (period) {
    case "month": {
      const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { start, end };
    }
    case "quarter": {
      const qStart = Math.floor(m / 3) * 3;
      const start = `${y}-${String(qStart + 1).padStart(2, "0")}-01`;
      const endMonth = qStart + 3;
      const lastDay = new Date(y, endMonth, 0).getDate();
      const end = `${y}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { start, end };
    }
    case "year":
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    default:
      return { start: null, end: null };
  }
}
