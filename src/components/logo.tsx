import { cn } from "@/lib/utils";

/* ─── FiniTax Logomark ─────────────────────────────────────────────────
   An indigo-to-violet rounded-square with a white "F" letterform
   and a jade (Guatemala) accent dot.
─────────────────────────────────────────────────────────────────────── */
interface MarkProps {
  size?: number;
  className?: string;
}

export function FiniTaxMark({ size = 40, className }: MarkProps) {
  const inner = Math.round(size * 0.575);
  const radius = Math.round(size * 0.27);
  return (
    <div
      style={{ width: size, height: size, borderRadius: radius }}
      className={cn(
        "flex-shrink-0 gradient-primary flex items-center justify-center shadow-md shadow-primary/40 relative overflow-hidden",
        className
      )}
    >
      <svg width={inner} height={inner} viewBox="0 0 23 23" fill="none">
        {/* F – vertical bar */}
        <rect x="2" y="1" width="3.5" height="21" rx="1.75" fill="white" fillOpacity="0.97" />
        {/* F – top horizontal bar */}
        <rect x="2" y="1" width="15" height="3.5" rx="1.75" fill="white" fillOpacity="0.97" />
        {/* F – middle horizontal bar */}
        <rect x="2" y="10" width="10" height="3" rx="1.5" fill="white" fillOpacity="0.97" />
        {/* Guatemala jade accent circle */}
        <circle cx="19.5" cy="17" r="3.5" fill="#10b981" />
      </svg>
    </div>
  );
}

/* ─── Fini Tax Full Logo (mark + wordmark + GT tag) ─── */
interface LogoProps {
  size?: number;
  textSize?: string;
  className?: string;
  showTag?: boolean;
}

export function FiniTaxLogo({ size = 36, textSize = "text-lg", className, showTag = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <FiniTaxMark size={size} />
      <div className="flex items-center gap-1.5">
        <span className={cn("font-bold tracking-tight", textSize)}>
          Fini <span className="text-primary">Tax</span>
        </span>
        {showTag && (
          <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 tracking-wider leading-none">
            GT
          </span>
        )}
      </div>
    </div>
  );
}
