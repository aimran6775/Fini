"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Algo salió mal</h2>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-muted-foreground/60">Código: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset} className="rounded-xl gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="rounded-xl gap-2 gradient-primary border-0 text-white">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
