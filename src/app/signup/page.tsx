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
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    // Email confirmation disabled → session exists → go to dashboard
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    // Fallback: email confirmation enabled
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">¡Revisa tu Correo!</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos un enlace de confirmación a <strong>{email}</strong>.
          </p>
          <Link href="/login"><Button variant="outline" className="rounded-xl mt-2">Ir a Iniciar Sesión</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/"><FiniTaxLogo size={40} textSize="text-xl" /></Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight">Crear Cuenta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Regístrate gratis en FiniTax</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && <AlertBanner variant="destructive" message={error} />}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" type="text" placeholder="Tu nombre" className="h-11 pl-10 rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="tu@empresa.com" className="h-11 pl-10 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" className="h-11 pl-10 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg transition-all font-semibold" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <>Crear Cuenta<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
