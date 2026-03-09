"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Receipt, Calculator, Users, BarChart3, Bot,
  Shield, ArrowRight, CheckCircle2, Landmark,
  Zap, Lock, Sparkles, TrendingUp, Globe, Wrench,
} from "lucide-react";
import { FiniTaxLogo } from "@/components/logo";

/* ── Data ──────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Receipt,
    title: "Facturación FEL",
    description:
      "FACT, FCAM, FPEQ, FCAP y notas de crédito — 10 tipos de documento electrónico certificados por SAT al instante.",
    gradient: "from-violet-500 to-indigo-600",
    tag: "SAT Certificado",
  },
  {
    icon: Calculator,
    title: "Motor de Impuestos",
    description:
      "ISR, IVA 12%, ISO 1% y retenciones calculadas automáticamente según tu régimen y calendario fiscal.",
    gradient: "from-cyan-500 to-blue-600",
    tag: "Automatizado",
  },
  {
    icon: Users,
    title: "Planilla & IGSS",
    description:
      "Nómina con IGSS 4.83% / 10.67%, IRTRA, INTECAP, Aguinaldo, Bono 14 y vacaciones en segundos.",
    gradient: "from-emerald-500 to-green-600",
    tag: "Multi-empleado",
  },
  {
    icon: Landmark,
    title: "Contabilidad",
    description:
      "Plan de cuentas, partidas de diario, libro mayor, estados financieros y conciliación bancaria.",
    gradient: "from-amber-500 to-orange-600",
    tag: "NIIF Compatible",
  },
  {
    icon: BarChart3,
    title: "Reportes",
    description:
      "Balance general, estado de resultados, flujo de caja y presupuestos actualizados en tiempo real.",
    gradient: "from-pink-500 to-rose-600",
    tag: "Tiempo Real",
  },
  {
    icon: Bot,
    title: "Asistente IA",
    description:
      "Consulta leyes tributarias guatemaltecas con IA. Respuestas con referencia legal exacta del Decreto.",
    gradient: "from-purple-500 to-fuchsia-600",
    tag: "AI Powered",
  },
];

const taxItems = [
  { label: "IVA 12%", desc: "Crédito y Débito Fiscal automático en cada transacción" },
  { label: "ISR Utilidades", desc: "25% anual sobre utilidades — declaración automatizada" },
  { label: "ISR Simplificado", desc: "5% / 7% trimestral según tramo de ingresos brutos" },
  { label: "ISO 1%", desc: "Trimestral sobre activos netos o ingresos brutos" },
  { label: "IGSS Patronal", desc: "10.67% + IRTRA 1% + INTECAP 1% en cada planilla" },
  { label: "Retenciones ISR", desc: "5% servicios, 6% bienes, 15% no domiciliados" },
  { label: "FEL Obligatorio", desc: "10 tipos de documento electrónico SAT" },
  { label: "Timbre Fiscal", desc: "3% sobre documentos no afectos al IVA" },
];

const steps = [
  {
    num: "01",
    icon: Globe,
    title: "Crea tu Empresa",
    desc: "Registra tu NIT, razón social y régimen fiscal en menos de 5 minutos.",
  },
  {
    num: "02",
    icon: Wrench,
    title: "Configura tu Operación",
    desc: "Importa empleados, plan de cuentas y catálogo de productos.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Gestiona y Cumple",
    desc: "Factura FEL, corre planilla y declara impuestos — todo automatizado.",
  },
];

const kpiData = [
  { label: "Facturado (Nov)", val: "Q 128,400", sub: "+12%", subColor: "text-indigo-400" },
  { label: "IVA por Pagar", val: "Q 13,726", sub: "Vence Dic 31", subColor: "text-amber-400" },
  { label: "Planilla Mes", val: "Q 45,200", sub: "8 empleados", subColor: "text-emerald-400" },
];

const chartHeights = [52, 68, 44, 82, 63, 88, 70, 94, 78, 86, 58, 100];
const chartMonths = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/* ── Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══════════════════ NAVIGATION ══════════════════ */}
      <nav className="fixed top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="glass-light rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg shadow-black/5">
            <Link href="/">
              <FiniTaxLogo size={34} textSize="text-[17px]" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#impuestos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Impuestos
              </a>
              <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cómo Funciona
              </a>
            </div>

            <Link href="/signup">
              <Button
                size="sm"
                className="gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-105 transition-all duration-200 font-semibold rounded-xl"
              >
                Comenzar Gratis →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section
        className="relative flex flex-col items-center justify-start overflow-hidden pt-36 pb-0"
        style={{ background: "#06060f", minHeight: "100vh" }}
      >
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="animate-blob absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full blur-[130px]"
            style={{ background: "rgba(79,70,229,0.28)" }}
          />
          <div
            className="animate-blob delay-2000 absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full blur-[120px]"
            style={{ background: "rgba(124,58,237,0.22)" }}
          />
          <div
            className="animate-blob delay-4000 absolute -bottom-24 left-1/4 h-[500px] w-[500px] rounded-full blur-[100px]"
            style={{ background: "rgba(16,185,129,0.16)" }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          {/* Badge */}
          <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-xs font-medium text-white/65 mb-10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hecho exclusivamente para Guatemala · SAT FEL Certificado
          </div>

          {/* H1 */}
          <h1 className="animate-fade-in-up text-5xl sm:text-6xl md:text-[76px] font-black tracking-tight text-white leading-[1.04] mb-6">
            Gestión Fiscal
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Hecha para Guatemala
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ animationDelay: "0.15s" }}
          >
            Facturación FEL, planilla IGSS, ISR · IVA · ISO y contabilidad completa —
            la plataforma que entiende la legislación de SAT.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up flex flex-wrap justify-center gap-4"
            style={{ animationDelay: "0.28s" }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 px-8 text-base gradient-primary border-0 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.04] transition-all duration-300 font-semibold rounded-xl"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#funcionalidades">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-white/15 text-white/75 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                Ver Funcionalidades
              </Button>
            </a>
          </div>

          {/* Trust signals */}
          <div
            className="animate-fade-in mt-9 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs"
            style={{ animationDelay: "0.45s", color: "rgba(255,255,255,0.28)" }}
          >
            <span>✓ Sin tarjeta de crédito</span>
            <span>✓ Configuración en 5 min</span>
            <span>✓ Soporte en español</span>
            <span>✓ 100% en Quetzales</span>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div
          className="animate-fade-in-up relative z-10 mt-16 w-full max-w-3xl px-6"
          style={{ animationDelay: "0.38s" }}
        >
          {/* Glow behind card */}
          <div
            className="absolute inset-x-8 bottom-0 top-4 rounded-3xl blur-3xl"
            style={{ background: "rgba(79,70,229,0.18)" }}
          />

          {/* Mockup card */}
          <div
            className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{
              background: "rgba(11,11,24,0.88)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-3 px-5 py-3 border-b border-white/5"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(234,179,8,0.5)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.5)" }} />
              </div>
              <div
                className="mx-auto flex items-center gap-1.5 h-6 w-56 rounded-lg px-3"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.7)" }} />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  app.finitax.gt/dashboard
                </span>
              </div>
            </div>

            <div className="p-5">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {kpiData.map((k, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <p className="text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {k.label}
                    </p>
                    <p className="text-white font-bold text-sm">{k.val}</p>
                    <p className={`text-[11px] mt-1 font-medium ${k.subColor}`}>{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Ingresos 2025
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +18.4% vs 2024
                  </div>
                </div>
                <div className="flex items-end gap-[5px] h-[60px]">
                  {chartHeights.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 11
                            ? "linear-gradient(to top, #6366f1, #a78bfa)"
                            : "linear-gradient(to top, rgba(99,102,241,0.55), rgba(139,92,246,0.28))",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {chartMonths.map((m, i) => (
                    <span
                      key={i}
                      className="flex-1 text-center text-[9px]"
                      style={{
                        color: i === 11 ? "#818cf8" : "rgba(255,255,255,0.18)",
                        fontWeight: i === 11 ? 700 : 400,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fade into white */}
        <div
          className="relative z-10 w-full flex-shrink-0"
          style={{
            height: "8rem",
            background: `linear-gradient(to bottom, transparent, var(--color-background))`,
          }}
        />
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="funcionalidades" className="py-28 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Cada Herramienta que tu Empresa{" "}
              <span className="gradient-text">Necesita en Guatemala</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Diseñado específicamente para la legislación fiscal guatemalteca — de la primera
              factura hasta la declaración anual.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border bg-card p-7 hover-lift card-shine overflow-hidden cursor-default"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`}
                />
                <div className="relative">
                  <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground mb-5 tracking-wide">
                    {f.tag}
                  </span>
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explorar <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TAX COMPLIANCE ══════════════════ */}
      <section id="impuestos" className="py-28 px-4 bg-muted/40">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left sticky */}
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-5">
                <Shield className="h-3.5 w-3.5" />
                Cumplimiento SAT
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">
                100% Alineado con la{" "}
                <span className="gradient-text">Legislación Guatemalteca</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Cada tasa, cada régimen y cada fecha límite — actualizado automáticamente según
                SAT, IGSS y BANGUAT.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-primary border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.03] transition-all font-semibold rounded-xl"
                >
                  Automatizar mi Cumplimiento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { val: "12+", label: "Tipos de impuesto" },
                  { val: "10", label: "Documentos FEL" },
                  { val: "100%", label: "Cumplimiento SAT" },
                  { val: "24/7", label: "Asistente IA" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border bg-card p-4">
                    <p className="text-2xl font-black">{s.val}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right checklist */}
            <div className="space-y-3">
              {taxItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-[18px] w-[18px] text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="como-funciona" className="py-28 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Zap className="h-3.5 w-3.5" />
            Cómo Funciona
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-16">
            De Cero a Facturando en{" "}
            <span className="gradient-text">3 Pasos</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-[calc(16.5%+2.5rem)] right-[calc(16.5%+2.5rem)] h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border-2 border-primary/15 shadow-lg hover:border-primary/35 transition-all">
                    <s.icon className="h-9 w-9 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-white text-xs font-black shadow-md">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section
        className="py-28 px-4 relative overflow-hidden"
        style={{ background: "#06060f" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 left-1/4 h-[450px] w-[450px] rounded-full blur-[100px]"
            style={{ background: "rgba(79,70,229,0.26)" }}
          />
          <div
            className="absolute -bottom-20 right-1/4 h-[350px] w-[350px] rounded-full blur-[80px]"
            style={{ background: "rgba(124,58,237,0.2)" }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Comienza hoy — es gratis
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Tu Empresa. Tu Fiscalidad.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Bajo Control.
            </span>
          </h2>
          <p
            className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Únete a empresas guatemaltecas que ya gestionan su contabilidad e impuestos con
            FiniTax.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 px-10 text-base bg-white text-[#06060f] hover:bg-white/92 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all duration-300 rounded-xl"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base border-white/14 bg-white/5 hover:bg-white/10 hover:text-white transition-all rounded-xl"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Ya Tengo Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t bg-card py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <FiniTaxLogo size={34} textSize="text-[17px]" className="mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contabilidad e impuestos para empresas guatemaltecas. Cumplimiento SAT
                garantizado.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Facturación FEL</a></li>
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Contabilidad</a></li>
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Planilla IGSS</a></li>
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Asistente IA</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Impuestos</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#impuestos" className="hover:text-foreground transition-colors">ISR / IVA / ISO</a></li>
                <li><a href="#impuestos" className="hover:text-foreground transition-colors">IGSS / IRTRA</a></li>
                <li><a href="#impuestos" className="hover:text-foreground transition-colors">FEL Electrónico</a></li>
                <li><a href="#impuestos" className="hover:text-foreground transition-colors">Reportes SAT</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Cuenta</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Registrarse Gratis</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FiniTax Guatemala. Todos los derechos reservados.</p>
            <p className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Cumplimiento SAT · FEL Certificado · Datos Encriptados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
