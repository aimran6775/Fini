"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Receipt, Calculator, Users, Building2, BarChart3, Bot,
  Shield, FileText, ArrowRight, CheckCircle2, Landmark, Wallet,
  Wrench, ChevronDown, Zap, Globe, Lock, Sparkles,
  TrendingUp, Play, Star
} from "lucide-react";

/* ─── Feature cards ─── */
const features = [
  {
    icon: Receipt,
    title: "Facturación FEL",
    description: "FACT, FCAM, FPEQ, FCAP, notas de crédito/débito — todo certificado por SAT al instante.",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: Calculator,
    title: "Motor de Impuestos",
    description: "ISR (25% Utilidades o 5%/7% Simplificado), IVA 12%, ISO 1%, retenciones y timbre fiscal.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Planilla y IGSS",
    description: "Nómina con IGSS 4.83%/10.67%, IRTRA, INTECAP, Aguinaldo, Bono 14, vacaciones.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Landmark,
    title: "Contabilidad",
    description: "Plan de cuentas, partidas de diario, libro mayor, estados financieros y conciliación.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "Reportes en Tiempo Real",
    description: "Balance general, estado de resultados, flujo de caja, presupuestos y proyecciones.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Bot,
    title: "Asistente IA Fiscal",
    description: "Consulta leyes tributarias guatemaltecas con IA. Respuestas con referencia legal.",
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

/* ─── Tax items ─── */
const taxItems = [
  "IVA 12% — Crédito y Débito Fiscal automático",
  "ISR Régimen sobre Utilidades (25%) o Simplificado (5%/7%)",
  "ISO 1% trimestral sobre activos netos o ingresos brutos",
  "IGSS patronal 10.67% + IRTRA 1% + INTECAP 1%",
  "Retenciones ISR: 5% servicios, 6% bienes, 15% no domiciliados",
  "Timbre Fiscal 3% sobre documentos no afectos al IVA",
  "Depreciación fiscal según Decreto 10-2012",
  "FEL obligatorio — 10 tipos de documento electrónico",
];

/* ─── Stats ─── */
const stats = [
  { value: "12+", label: "Tipos de Impuesto", icon: Calculator },
  { value: "10", label: "Documentos FEL", icon: FileText },
  { value: "100%", label: "Cumplimiento SAT", icon: Shield },
  { value: "24/7", label: "Asistente IA", icon: Bot },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="fixed top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="glass-light rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg shadow-black/5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white font-bold text-sm shadow-md shadow-primary/30">
                F
              </div>
              <span className="text-lg font-bold tracking-tight">
                Fini<span className="text-primary">Tax</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#compliance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cumplimiento
              </a>
              <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Nosotros
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO — Full-Screen Video ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/guatemala-poster.jpg"
            className="h-full w-full object-cover"
          >
            <source src="https://videos.pexels.com/video-files/4065924/4065924-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          {/* Badge */}
          <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm text-white/90 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-jade animate-pulse" />
            <Building2 className="h-3.5 w-3.5" />
            Plataforma #1 para empresas guatemaltecas
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Contabilidad e Impuestos{" "}
            <span className="gradient-text">Todo en Uno</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Facturación FEL, ISR, IVA, ISO, planilla IGSS y contabilidad completa.
            Cumple con SAT sin esfuerzo — todo desde una sola plataforma.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-400 mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-base gradient-primary border-0 text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-14 px-10 text-base glass border-white/20 text-white hover:bg-white/10 hover:text-white transition-all duration-300">
                <Play className="mr-2 h-4 w-4" />
                Ver Funcionalidades
              </Button>
            </a>
          </div>

          {/* Social proof line */}
          <div className="animate-fade-in delay-700 mt-12 flex items-center justify-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-black/30 flex items-center justify-center text-[10px] font-bold text-white">
                    {["A", "M", "C", "R"][i]}
                  </div>
                ))}
              </div>
              <span className="ml-2">Empresas activas</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">5.0 valoración</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="animate-scroll-hint">
            <ChevronDown className="h-6 w-6 text-white/50" />
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section id="stats" className="relative -mt-16 z-20 mx-auto max-w-5xl px-4">
        <div className="glass-light rounded-2xl p-1 shadow-2xl shadow-black/10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-8 px-4">
                <stat.icon className="h-5 w-5 text-primary mb-2" />
                <span className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES — Bento Grid ═══════════ */}
      <section id="features" className="py-32 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Todo lo que Necesitas,{" "}
              <span className="gradient-text">Nada que Sobre</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              De la facturación a la declaración — una plataforma para toda tu operación financiera en Guatemala.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border bg-card p-8 hover-lift card-shine transition-all duration-300"
              >
                {/* Icon */}
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-7 w-7" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>

                {/* Hover arrow */}
                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explorar <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TAX COMPLIANCE ═══════════ */}
      <section id="compliance" className="py-32 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />

        <div className="mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-jade/10 px-4 py-1.5 text-sm font-medium text-jade mb-4">
                <Shield className="h-3.5 w-3.5" />
                Cumplimiento SAT
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                Cumplimiento Fiscal{" "}
                <span className="gradient-text">Guatemalteco Completo</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Cada tasa, cada régimen, cada obligación — automatizado y actualizado según la legislación vigente de SAT.
              </p>

              <Link href="/signup">
                <Button size="lg" className="gradient-primary border-0 text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                  Automatizar mi Cumplimiento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Right — Tax items */}
            <div className="space-y-3">
              {taxItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jade/10 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-jade" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW SECTION ═══════════ */}
      <section className="py-32 px-4 bg-muted/50">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Zap className="h-3.5 w-3.5" />
            Así de Fácil
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-16">
            De Cero a Facturando en{" "}
            <span className="gradient-text">3 Pasos</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crea tu Cuenta",
                desc: "Registra tu empresa, NIT y régimen fiscal en minutos.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Configura tu Negocio",
                desc: "Importa tu plan de cuentas, empleados y catálogo de productos.",
                icon: Wrench,
              },
              {
                step: "03",
                title: "Gestiona Todo",
                desc: "Factura, declara impuestos y corre planilla — todo automatizado.",
                icon: TrendingUp,
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card border-2 border-primary/10 shadow-lg shadow-primary/5">
                      <s.icon className="h-10 w-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold shadow-md">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white/80 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Comienza ahora — es gratis
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Tu Contabilidad en Guatemala,{" "}
            <span className="gradient-text">Resuelta.</span>
          </h2>
          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
            Registra tu empresa, configura tu NIT y régimen ISR, y empieza a facturar en minutos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-base bg-white text-foreground hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-base glass border-white/20 text-white hover:bg-white/10 hover:text-white transition-all">
                Ya Tengo Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t bg-card py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white font-bold text-sm">
                  F
                </div>
                <span className="text-lg font-bold">
                  Fini<span className="text-primary">Tax</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma integral de contabilidad e impuestos para empresas guatemaltecas.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Facturación FEL</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Contabilidad</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Planilla</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Impuestos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Cumplimiento</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#compliance" className="hover:text-foreground transition-colors">ISR / IVA / ISO</a></li>
                <li><a href="#compliance" className="hover:text-foreground transition-colors">IGSS / IRTRA</a></li>
                <li><a href="#compliance" className="hover:text-foreground transition-colors">FEL Electrónico</a></li>
                <li><a href="#compliance" className="hover:text-foreground transition-colors">Reportes SAT</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Empresa</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Crear Cuenta</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FiniTax Guatemala. Todos los derechos reservados.</p>
            <p className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Cumplimiento SAT • FEL Certificado • Datos Encriptados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
