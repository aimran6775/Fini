"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck,
} from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

/* Verified Pexels: Guatemala church bell towers */
const VIDEO_SRC = "https://videos.pexels.com/video-files/13830622/13830622-hd_1920_1080_30fps.mp4";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Email confirmation disabled → session exists immediately
    if (data.session) {
      router.push("/onboarding");
      return;
    }

    // Fallback: email confirmation is enabled
    setSuccess(true);
    setLoading(false);
  };

  /* ─── Success: check-email screen ─── */
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">¡Revisa tu Correo!</h1>
          <p className="text-muted-foreground">
            Enviamos un enlace de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/login">
            <Button variant="outline" className="rounded-xl mt-4">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* ─── Left: Guatemala Video Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient fallback */}
        <div className="absolute inset-0 gradient-hero" />
        {/* Video */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/">
            <FiniTaxLogo size={38} textSize="text-xl" className="[&_span]:text-white" />
          </Link>

          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-white/30" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Crear Cuenta</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Empieza a gestionar tus impuestos{" "}
              <span className="text-cyan-300">hoy mismo.</span>
            </h2>
            <p className="text-white/60 leading-relaxed">
              Únete a cientos de negocios guatemaltecos que ya confían en FiniTax para su facturación, contabilidad e impuestos.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Sin costo para empezar — prueba gratis",
                "Cumplimiento automático con SAT y FEL",
                "Soporte para múltiples organizaciones",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/50">
            <span>© {new Date().getFullYear()} FiniTax</span>
            <span>Guatemala</span>
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
            Ya tengo cuenta
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8">
              <FiniTaxLogo size={36} textSize="text-xl" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight">Crear Tu Cuenta</h1>
              <p className="mt-2 text-muted-foreground">Regístrate gratis y configura tu organización</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && <AlertBanner variant="destructive" message={error} />}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
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
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repetir contraseña"
                    className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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
                    Crear Cuenta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
              Al registrarte aceptas los{" "}
              <span className="underline cursor-pointer">Términos de Servicio</span> y la{" "}
              <span className="underline cursor-pointer">Política de Privacidad</span>.
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
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
