"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface YearSelectorProps {
  currentYear: number;
}

export function YearSelector({ currentYear }: YearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedYear = parseInt(searchParams.get("year") || String(currentYear));

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", e.target.value);
    router.push(`?${params.toString()}`);
  }

  return (
    <select 
      className="rounded-md border px-3 py-2 text-sm"
      value={selectedYear}
      onChange={handleChange}
    >
      {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}
