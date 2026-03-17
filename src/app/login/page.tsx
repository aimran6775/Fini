"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { FiniTaxLogo } from "@/components/logo";
import { ArrowRight, Eye, EyeOff, Mail, Lock, Languages } from "lucide-react";

export default function LoginPage() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(t.auth.errorWrongCredentials);
      setLoading(false);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-blob" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-slate-600/10 blur-[100px] animate-blob delay-2000" />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          aria-label="Cambiar idioma"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Languages className="h-4 w-4" />
          <span className="font-medium">{lang === "es" ? "EN" : "ES"}</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link href="/" className="inline-block">
            <FiniTaxLogo size={40} textSize="text-2xl" className="text-white justify-center" />
          </Link>
        </div>

        {/* Card */}
        <div className="animate-fade-in-up rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-black/30">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">{t.auth.loginTitle}</h1>
            <p className="text-sm text-white/45 mt-2">{t.auth.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-medium text-white/50 uppercase tracking-wider">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  {t.auth.password}
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl gradient-premium py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {t.auth.loginButton}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/35">
              {t.auth.noAccount}{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {t.auth.registerFree}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          © {new Date().getFullYear()} Fini Tax GT
        </p>
      </div>
    </div>
  );
}
