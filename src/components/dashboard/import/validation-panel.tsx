"use client";

import { AlertCircle, AlertTriangle, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ValidationIssue } from "@/lib/import/validation";
import { cn } from "@/lib/utils";

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onJumpToCell: (row: number, field: string) => void;
  onApplySuggestion: (row: number, field: string, value: string) => void;
}

export function ValidationPanel({
  issues,
  onJumpToCell,
  onApplySuggestion,
}: ValidationPanelProps) {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
          <Sparkles className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-emerald-400">Sin errores</p>
        <p className="text-xs text-muted-foreground mt-1">
          Todos los registros son válidos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3 text-xs">
        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.length} {errors.length === 1 ? "error" : "errores"}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {warnings.length}{" "}
            {warnings.length === 1 ? "advertencia" : "advertencias"}
          </span>
        )}
      </div>

      {/* Issue list */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {/* Errors first, then warnings */}
        {[...errors, ...warnings].map((issue, idx) => (
          <div
            key={`${issue.row}-${issue.field}-${idx}`}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs transition-colors",
              issue.severity === "error"
                ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
            )}
          >
            <button
              onClick={() => onJumpToCell(issue.row, issue.field)}
              className="flex items-start gap-2 w-full text-left"
            >
              {issue.severity === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-relaxed">
                  {issue.message}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Fila {issue.row + 1} → {issue.field}
                </p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
            </button>

            {issue.suggestion && (
              <div className="mt-1.5 ml-5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() =>
                    onApplySuggestion(issue.row, issue.field, issue.suggestion!)
                  }
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Aplicar: {issue.suggestion}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
