"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Error al cargar esta sección</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
          {error.message || "Ocurrió un error inesperado."}
        </p>
      </div>
      <Button onClick={reset} variant="outline" className="rounded-xl">
        Reintentar
      </Button>
    </div>
  );
}
