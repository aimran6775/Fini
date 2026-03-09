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
import { Mail, Lock, ArrowRight } from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/"><FiniTaxLogo size={40} textSize="text-xl" /></Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight">Iniciar Sesión</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ingresa a tu cuenta de FiniTax</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <AlertBanner variant="destructive" message={error} />}

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
                <Input id="password" type="password" placeholder="••••••••" className="h-11 pl-10 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg transition-all font-semibold" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <>Ingresar<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
