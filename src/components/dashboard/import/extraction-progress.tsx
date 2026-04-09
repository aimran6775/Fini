"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Brain, Table2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtractionProgressProps {
  status: "reading" | "extracting" | "structuring" | "validating" | "done" | "error";
  error?: string;
  rowCount?: number;
}

const STEPS = [
  { key: "reading", label: "Leyendo contenido", icon: Table2 },
  { key: "extracting", label: "Detectando datos con IA", icon: Brain },
  { key: "structuring", label: "Estructurando filas", icon: Table2 },
  { key: "validating", label: "Validando registros", icon: ShieldCheck },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function getStepIndex(status: ExtractionProgressProps["status"]): number {
  if (status === "done") return STEPS.length;
  if (status === "error") return -1;
  return STEPS.findIndex((s) => s.key === status);
}

export function ExtractionProgress({
  status,
  error,
  rowCount,
}: ExtractionProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const currentIdx = getStepIndex(status);

  useEffect(() => {
    if (status === "done" || status === "error") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  return (
    <div className="space-y-8 max-w-md mx-auto py-8">
      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = status !== "error" && i === currentIdx;
          const isComplete = status !== "error" && (i < currentIdx || status === "done");
          const isFailed = status === "error" && i === Math.max(0, currentIdx);

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300",
                isActive && "border-primary/50 bg-primary/5",
                isComplete && "border-emerald-500/30 bg-emerald-500/5",
                isFailed && "border-red-500/30 bg-red-500/5",
                !isActive && !isComplete && !isFailed && "border-border/30 opacity-50"
              )}
            >
              {isActive && (
                <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
              )}
              {isComplete && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              )}
              {isFailed && (
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              {!isActive && !isComplete && !isFailed && (
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary",
                  isComplete && "text-emerald-400",
                  isFailed && "text-red-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timer */}
      {status !== "done" && status !== "error" && (
        <p className="text-center text-sm text-muted-foreground tabular-nums">
          Procesando… {elapsed}s
        </p>
      )}

      {/* Done */}
      {status === "done" && rowCount !== undefined && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">
              {rowCount} {rowCount === 1 ? "registro encontrado" : "registros encontrados"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Completado en {elapsed}s — revisa y edita los datos antes de guardar
          </p>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
