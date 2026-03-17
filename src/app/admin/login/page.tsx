"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Only allow admin email
    if (email !== "admin@finitax.com") {
      setError("Acceso denegado. Solo administradores.");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white text-2xl font-black shadow-lg shadow-red-500/20 mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
          <p className="text-sm text-white/40 mt-1">Acceso restringido — Solo administradores</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Email Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@finitax.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Iniciar Sesión Admin
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/80">
              Este panel tiene acceso total a la base de datos. Todas las acciones se registran.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          FiniTax Guatemala — Panel de Administración v1.0
        </p>
      </div>
    </div>
  );
}
