"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiniTaxLogo, FiniTaxMark } from "@/components/logo";
import {
  FileText, BarChart3, Shield, Users, Building2, Calculator,
  ArrowRight, ChevronDown, CheckCircle2, Zap, TrendingUp,
  Globe2, Lock, Star,
} from "lucide-react";

/* ── Pexels Guatemala Video URLs ─────────────────────────────── */
const HERO_VIDEO = "https://videos.pexels.com/video-files/16679245/16679245-uhd_2560_1440_30fps.mp4";
const CTA_VIDEO  = "https://videos.pexels.com/video-files/35224277/14923245/pexels-35224277-14923245-landscape-4k.mp4";

/* ── Data ─────────────────────────────────────────────────────── */
const features = [
  { icon: FileText,   title: "Facturación FEL", desc: "Emisión de facturas electrónicas certificadas por SAT en tiempo real. DTE, facturas especiales, notas de crédito y más." },
  { icon: Calculator, title: "Cálculo de Impuestos", desc: "IVA, ISR, ISO e IGSS calculados automáticamente según las leyes vigentes de Guatemala." },
  { icon: BarChart3,  title: "Reportes Financieros", desc: "Balance general, estado de resultados y flujo de efectivo generados al instante." },
  { icon: Users,      title: "Planilla & IGSS", desc: "Gestión completa de nómina con cálculo automático de IGSS patronal y laboral." },
  { icon: Building2,  title: "Multi-Empresa", desc: "Administre múltiples organizaciones desde un solo panel con aislamiento total de datos." },
  { icon: Shield,     title: "Seguridad Bancaria", desc: "Encriptación de nivel bancario, autenticación segura y respaldos automáticos diarios." },
];

const taxItems = [
  { label: "IVA (12%)", detail: "Incluido en precio, extracción automática" },
  { label: "ISR Utilidades (25%)", detail: "Régimen sobre utilidades de actividades lucrativas" },
  { label: "ISR Simplificado (5%/7%)", detail: "Régimen opcional simplificado sobre ingresos" },
  { label: "ISO (1%)", detail: "Impuesto de solidaridad trimestral" },
  { label: "IGSS Laboral (4.83%)", detail: "Cuota del trabajador" },
  { label: "IGSS Patronal (10.67%)", detail: "Cuota del empleador" },
  { label: "Retención ISR", detail: "Cálculo automático según tabla progresiva" },
  { label: "Bono 14 & Aguinaldo", detail: "Provisión mensual automática" },
];

const steps = [
  { num: "01", title: "Cree su Cuenta", desc: "Regístrese en segundos y configure su empresa con nuestro asistente inteligente." },
  { num: "02", title: "Configure su Empresa", desc: "Ingrese su NIT, datos fiscales y personalice su plan de cuentas contable." },
  { num: "03", title: "Empiece a Facturar", desc: "Emita facturas FEL, registre gastos y genere reportes desde el primer día." },
];

const kpiData = [
  { label: "Ingresos", value: "Q 847,320", change: "+12.5%", positive: true },
  { label: "Gastos", value: "Q 234,150", change: "-3.2%", positive: true },
  { label: "Utilidad Neta", value: "Q 613,170", change: "+18.7%", positive: true },
];

const chartHeights = [35, 45, 40, 55, 50, 65, 60, 75, 70, 85, 80, 92];
const chartMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/* ── VideoBackground Component ───────────────────────────────── */
function VideoBackground({ src, overlay = "bg-black/60", children, className = "" }: {
  src: string; overlay?: string; children?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={src} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── CountUp animation ───────────────────────────────────────── */
function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050514] text-white">
      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#050514]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <FiniTaxLogo size={34} textSize="text-xl" className="text-white" />
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-white/60 hover:text-white transition-colors">Funciones</a>
            <a href="#taxes" className="text-white/60 hover:text-white transition-colors">Impuestos</a>
            <a href="#how" className="text-white/60 hover:text-white transition-colors">Cómo Funciona</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Iniciar Sesión
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white text-[#050514] px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/10">
              Comenzar Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <VideoBackground src={HERO_VIDEO} overlay="bg-gradient-to-b from-[#050514]/70 via-[#050514]/50 to-[#050514]" className="min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/80 mb-8">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Plataforma #1 de Contabilidad en Guatemala
            </div>

            <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Contabilidad{" "}
              <span className="gradient-text">Inteligente</span>
              <br />para Guatemala
            </h1>

            <p className="animate-fade-in-up delay-200 mt-6 text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed">
              Facturación FEL, impuestos, planilla e IGSS — todo automatizado
              en una plataforma premium diseñada para empresas guatemaltecas.
            </p>

            <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full gradient-premium px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02]">
                Empezar Gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-6 py-4 text-sm font-medium text-white/80 hover:bg-white/10 transition-all">
                Ver Funciones
              </a>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-in-up delay-500 mt-12 flex flex-wrap items-center gap-6 text-xs text-white/40">
              <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Encriptación SSL</div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Certificado SAT</div>
              <div className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> Hecho en Guatemala</div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex justify-center">
            <ChevronDown className="h-6 w-6 text-white/30 animate-scroll-hint" />
          </div>
        </div>
      </VideoBackground>

      {/* ── Dashboard Mockup ─────────────────────────────────── */}
      <section className="relative -mt-32 z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-1 shadow-2xl shadow-black/40">
          <div className="rounded-xl bg-[#0a0a1a] p-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {kpiData.map((kpi, i) => (
                <div key={i} className="rounded-xl bg-white/[0.04] border border-white/5 p-4 hover:border-white/10 transition-colors">
                  <p className="text-xs text-white/40 mb-1">{kpi.label}</p>
                  <p className="text-xl font-bold text-white">{kpi.value}</p>
                  <span className={`text-xs font-medium ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <p className="text-xs text-white/40 mb-4">Ingresos Mensuales 2024</p>
              <div className="flex items-end gap-1.5 h-24">
                {chartHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm bg-gradient-to-t from-indigo-500 to-purple-500 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] text-white/30">{chartMonths[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">Funciones Premium</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Todo lo que su empresa <span className="gradient-text">necesita</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg">
              Una suite completa de herramientas financieras, diseñada específicamente para el mercado guatemalteco.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-500 card-shine">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="border-y border-white/5 py-16">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 2500, suffix: "+", label: "Empresas Activas" },
            { value: 150000, suffix: "+", label: "Facturas Emitidas" },
            { value: 99, suffix: ".9%", label: "Uptime" },
            { value: 24, suffix: "/7", label: "Soporte" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl sm:text-4xl font-bold gradient-text">
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tax Compliance ────────────────────────────────────── */}
      <section id="taxes" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Cumplimiento Fiscal</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Todos los impuestos de <span className="gradient-text">Guatemala</span>
              </h2>
              <p className="mt-4 text-white/50 text-lg leading-relaxed">
                Cálculos automáticos y actualizados según las leyes tributarias vigentes de la SAT. Sin errores, sin multas.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-white/60">Actualizado con las leyes tributarias 2024-2025</p>
              </div>
            </div>
            <div className="space-y-3">
              {taxItems.map((item, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-white/40">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how" className="py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-widest mb-3">Cómo Funciona</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Listo en <span className="gradient-text-gold">3 pasos</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
                  <span className="text-2xl font-bold gradient-text">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t border-dashed border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <VideoBackground src={CTA_VIDEO} overlay="bg-[#050514]/70" className="py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white/70 mb-6">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            Únase a miles de empresas guatemaltecas
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Lleve su contabilidad al{" "}
            <span className="gradient-text">siguiente nivel</span>
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto">
            Empiece hoy y descubra por qué FiniTax es la plataforma preferida de los contadores guatemaltecos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-white text-[#050514] px-8 py-4 text-base font-semibold hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10 hover:scale-[1.02]">
              Crear Cuenta Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 transition-all">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </VideoBackground>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <FiniTaxLogo size={28} textSize="text-base" className="text-white/60" />
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} FiniTax Guatemala. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white/60 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
