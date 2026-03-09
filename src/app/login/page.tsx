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
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

/* Verified Pexels: Aerial view of Guatemala volcano */
const VIDEO_SRC = "https://videos.pexels.com/video-files/16814325/16814325-uhd_2560_1440_60fps.mp4";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { videoRef.current?.play().catch(() => {}); }, []);

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
      {/* ─── Left: Guatemala Nature Video Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          src={VIDEO_SRC} autoPlay muted loop playsInline preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/"><FiniTaxLogo size={38} textSize="text-xl" className="[&_span]:text-white" /></Link>
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
            <div className="mt-8 space-y-3">
              {["10 tipos de DTE FEL certificados por SAT", "ISR, IVA, ISO calculados automáticamente", "Planilla con IGSS, IRTRA e INTECAP"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <span>© {new Date().getFullYear()} FiniTax</span>
            <span>Cumplimiento SAT 100%</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex w-full lg:w-1/2 flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />Volver al Inicio
          </Link>
          <Link href="/signup" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Crear Cuenta</Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8"><FiniTaxLogo size={36} textSize="text-xl" /></div>
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
                  <Input id="email" type="email" placeholder="tu@empresa.com" className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="h-12 pl-11 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all text-base font-semibold" disabled={loading}>
                {loading ? <Spinner size="sm" /> : <>Ingresar<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">Regístrate gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
