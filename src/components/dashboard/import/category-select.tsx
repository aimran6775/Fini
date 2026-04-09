"use client";

import { Receipt, Wallet, Users, Package, Landmark } from "lucide-react";
import type { ImportCategory, CategoryConfig } from "@/lib/import/schemas";
import { IMPORT_CATEGORIES } from "@/lib/import/schemas";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<ImportCategory, React.ReactNode> = {
  invoice: <Receipt className="h-7 w-7" />,
  expense: <Wallet className="h-7 w-7" />,
  contact: <Users className="h-7 w-7" />,
  product: <Package className="h-7 w-7" />,
  bank_transaction: <Landmark className="h-7 w-7" />,
};

const CATEGORY_COLORS: Record<ImportCategory, string> = {
  invoice: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  expense: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
  contact: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  product: "text-purple-400 bg-purple-500/10 ring-purple-500/20",
  bank_transaction: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20",
};

interface CategorySelectProps {
  onSelect: (category: ImportCategory) => void;
}

export function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          ¿Qué deseas importar?
        </h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de registro para comenzar la importación
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {IMPORT_CATEGORIES.map((cat: CategoryConfig) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-xl border border-border/50 bg-card p-5",
              "text-left transition-all duration-200",
              "hover:border-border hover:bg-accent/50 hover:shadow-lg hover:shadow-black/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "dark:ring-1 dark:ring-white/[0.06] dark:hover:ring-white/[0.12]"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg ring-1",
                CATEGORY_COLORS[cat.id]
              )}
            >
              {CATEGORY_ICONS[cat.id]}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{cat.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="mt-auto pt-2">
              <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                Destino: {cat.destination}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
