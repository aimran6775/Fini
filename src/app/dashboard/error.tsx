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
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <h2 className="text-lg font-bold">Error al cargar esta sección</h2>
      <p className="text-sm text-muted-foreground max-w-md">{error.message || "Ocurrió un error inesperado."}</p>
      <Button onClick={reset} variant="outline">Reintentar</Button>
    </div>
  );
}
