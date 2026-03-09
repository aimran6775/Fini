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
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-muted/30">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-jade/10">
            <CheckCircle2 className="h-10 w-10 text-jade" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">¡Cuenta Creada!</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Revisa tu correo electrónico para confirmar tu cuenta. Luego podrás iniciar sesión y configurar tu empresa.
          </p>
          <Link href="/login">
            <Button className="h-12 px-8 rounded-xl gradient-primary border-0 text-white shadow-md shadow-primary/25">
              Ir a Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ─── Left: Visual Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="https://videos.pexels.com/video-files/4065924/4065924-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-900/60 to-black/60" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg border border-white/20">
              F
            </div>
            <span className="text-xl font-bold">
              FiniTax <span className="text-white/60 text-sm font-normal">Guatemala</span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-white/30" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Crea tu Cuenta</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Comienza a{" "}
              <span className="text-emerald-300">Facturar Hoy.</span>
            </h2>
            <p className="text-white/60 leading-relaxed">
              Únete a miles de empresas guatemaltecas que gestionan su contabilidad, impuestos y planilla con FiniTax.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Facturación FEL certificada por SAT",
                "ISR, IVA, ISO automáticos",
                "Planilla con IGSS, IRTRA e INTECAP",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/50">
            <span>© {new Date().getFullYear()} FiniTax</span>
            <span>100% Cumplimiento SAT</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Signup Form ─── */}
      <div className="flex w-full lg:w-1/2 flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Ya Tengo Cuenta
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white font-bold shadow-md shadow-primary/25">
                F
              </div>
              <span className="text-xl font-bold">
                Fini<span className="text-primary">Tax</span>
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight">Crear Cuenta</h1>
              <p className="mt-2 text-muted-foreground">Registra tu cuenta en FiniTax Guatemala</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && <AlertBanner variant="destructive" message={error} />}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Juan Pérez"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Crear mi Cuenta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
