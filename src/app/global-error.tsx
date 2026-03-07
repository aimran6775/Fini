"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="es-GT">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground text-sm">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <Button onClick={reset}>Intentar de nuevo</Button>
        </div>
      </body>
    </html>
  );
}
