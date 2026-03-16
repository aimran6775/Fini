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
