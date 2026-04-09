"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      });

      if (resetError) {
        setError("No se pudo enviar el correo. Intenta de nuevo.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1114] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <FiniTaxLogo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <Card className="border-border/50 bg-[#151a1e]">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-emerald-500/10 p-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white">Correo enviado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revisa tu bandeja de entrada en <strong className="text-white">{email}</strong> y
                    sigue el enlace para restablecer tu contraseña.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  ¿No lo ves? Revisa tu carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
