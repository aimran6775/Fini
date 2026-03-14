"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStaleDeployment =
    error.message?.includes("Server Action") ||
    error.message?.includes("older or newer deployment") ||
    error.digest?.includes("NEXT_NOT_FOUND");

  useEffect(() => {
    console.error("Dashboard error:", error);
    // Auto-reload on stale deployment errors
    if (isStaleDeployment) {
      window.location.reload();
    }
  }, [error, isStaleDeployment]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">
          {isStaleDeployment ? "Versión actualizada disponible" : "Error al cargar esta sección"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
          {isStaleDeployment
            ? "Se detectó una nueva versión de la aplicación. Recargando..."
            : error.message || "Ocurrió un error inesperado."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" /> Recargar página
        </Button>
        {!isStaleDeployment && (
          <Button onClick={reset} variant="outline" className="rounded-xl">
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
