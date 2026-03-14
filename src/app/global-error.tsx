"use client";

import "./globals.css";
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
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Algo salió mal</h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Ocurrió un error inesperado. Por favor intenta de nuevo.
            </p>
          </div>
          <Button onClick={reset} className="rounded-xl">Intentar de nuevo</Button>
        </div>
      </body>
    </html>
  );
}
