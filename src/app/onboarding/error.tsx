"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Onboarding error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Error al configurar empresa</h2>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset} className="rounded-xl">
            Intentar de nuevo
          </Button>
          <Button onClick={() => router.push("/login")} className="rounded-xl gradient-primary border-0 text-white">
            Ir al Login
          </Button>
        </div>
      </div>
    </div>
  );
}
