"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { FiniTaxLogo, FiniTaxMark } from "@/components/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* ─── Left: Visual Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: '#06060f' }}>
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(79,70,229,0.35)' }} />
          <div className="animate-blob delay-2000 absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(124,58,237,0.28)' }} />
          <div className="animate-blob delay-4000 absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(16,185,129,0.18)' }} />
        </div>
        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Link href="/">
            <FiniTaxLogo size={38} textSize="text-xl" />
          </Link>

          {/* Quote / Info */}
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-white/30" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Plataforma Fiscal</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Tu Contabilidad Guatemalteca,{" "}
              <span className="text-cyan-300">Simplificada.</span>
            </h2>
            <p className="text-white/60 leading-relaxed">
              Facturación FEL, impuestos ISR/IVA/ISO, planilla con IGSS y contabilidad completa — todo en un solo lugar.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-6 text-sm text-white/50">
            <span>© {new Date().getFullYear()} FiniTax</span>
            <span>Cumplimiento SAT 100%</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex w-full lg:w-1/2 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <Link href="/signup" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Crear Cuenta
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <FiniTaxLogo size={36} textSize="text-xl" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight">Bienvenido de Vuelta</h1>
              <p className="mt-2 text-muted-foreground">Ingresa a tu cuenta de FiniTax Guatemala</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && <AlertBanner variant="destructive" message={error} />}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
