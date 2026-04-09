"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiniTaxLogo } from "@/components/logo";
import { useLanguage } from "@/lib/i18n";
import {
  FileText, BarChart3, Shield, Users, Building2, Calculator,
  ArrowRight, ChevronDown, CheckCircle2, TrendingUp,
  Lock, Sparkles, Receipt, PiggyBank,
  Menu, X, MessageCircle, Mail, ChevronUp,
} from "lucide-react";

/* ======================================================================
   COMPONENTS
   ====================================================================== */

/* Static dashboard mockup for the landing page preview */
function DashboardMockup() {
  const kpis = [
    { label: "Ingresos", value: "Q 148,320", trend: "+12%", up: true },
    { label: "Gastos", value: "Q 62,480", trend: "-3%", up: false },
    { label: "Utilidad Neta", value: "Q 85,840", trend: null, up: true },
    { label: "Saldo Bancario", value: "Q 214,600", trend: null, up: true },
  ];

  const invoices = [
    { client: "Distribuidora del Sur", amount: "Q 18,400", status: "Certificada", statusColor: "bg-emerald-500/20 text-emerald-400" },
    { client: "Tech Solutions GT", amount: "Q 7,200", status: "Certificada", statusColor: "bg-emerald-500/20 text-emerald-400" },
    { client: "Café Antigua S.A.", amount: "Q 3,850", status: "Borrador", statusColor: "bg-white/10 text-white/50" },
    { client: "Constructora Maya", amount: "Q 42,100", status: "Certificada", statusColor: "bg-emerald-500/20 text-emerald-400" },
  ];

  const chartBars = [
    { month: "Oct", revenue: 45, expense: 30 },
    { month: "Nov", revenue: 58, expense: 35 },
    { month: "Dic", revenue: 72, expense: 42 },
    { month: "Ene", revenue: 55, expense: 38 },
    { month: "Feb", revenue: 68, expense: 40 },
    { month: "Mar", revenue: 82, expense: 45 },
  ];

  return (
    <div className="flex rounded-lg overflow-hidden bg-[#09090b] text-white min-h-[340px] sm:min-h-[420px]">
      {/* Sidebar */}
      <div className="hidden sm:flex w-44 flex-col border-r border-white/5 bg-[#0a0a0a] py-3 px-2 gap-0.5">
        <div className="flex items-center gap-2 px-2 mb-4">
          <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-black">F</div>
          <span className="text-xs font-semibold text-white/90">FiniTax</span>
        </div>
        {[
          { label: "Inicio", active: true },
          { label: "Facturación FEL", active: false },
          { label: "Gastos", active: false },
          { label: "Bancos", active: false },
          { label: "Planilla", active: false },
          { label: "Impuestos", active: false },
          { label: "Reportes", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`px-2.5 py-1.5 rounded-md text-[11px] ${
              item.active
                ? "bg-white/5 text-white font-medium"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/30">Buenos días,</p>
            <p className="text-sm font-semibold text-white/90">Carlos</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-6 px-2 rounded-md bg-blue-600/20 text-blue-400 text-[9px] font-medium flex items-center">+ Nueva Factura</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-md border border-white/5 bg-white/[0.02] p-2 sm:p-2.5">
              <p className="text-[9px] text-white/30">{kpi.label}</p>
              <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">{kpi.value}</p>
              {kpi.trend && (
                <span className={`text-[9px] font-medium ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3 rounded-md border border-white/5 bg-white/[0.02] p-2.5">
            <p className="text-[10px] font-medium text-white/50 mb-2">Ingresos vs Gastos</p>
            <div className="flex items-end gap-1.5 h-20 sm:h-28">
              {chartBars.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex gap-px justify-center">
                    <div className="w-2 sm:w-3 rounded-t bg-emerald-500/60" style={{ height: `${bar.revenue}%` }} />
                    <div className="w-2 sm:w-3 rounded-t bg-rose-500/40" style={{ height: `${bar.expense}%` }} />
                  </div>
                  <span className="text-[8px] text-white/20">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-md border border-white/5 bg-white/[0.02] p-2.5">
            <p className="text-[10px] font-medium text-white/50 mb-2">Facturas Recientes</p>
            <div className="space-y-1.5">
              {invoices.map((inv) => (
                <div key={inv.client} className="flex items-center justify-between text-[10px]">
                  <div className="min-w-0 flex-1">
                    <p className="text-white/70 truncate">{inv.client}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-white/50 font-medium">{inv.amount}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${inv.statusColor}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ISR Calculator Component */
function ISRCalculator() {
  const { t } = useLanguage();
  const [monthlyIncome, setMonthlyIncome] = useState(15000);

  const annualIncome = monthlyIncome * 12;
  const personalDeduction = 48000;
  const taxableIncome = Math.max(0, annualIncome - personalDeduction);

  let annualISR = 0;
  const threshold = 300000;
  if (taxableIncome <= threshold) {
    annualISR = taxableIncome * 0.05;
  } else {
    annualISR = threshold * 0.05 + (taxableIncome - threshold) * 0.07;
  }
  annualISR = Math.round(annualISR * 100) / 100;
  const monthlyISR = Math.round((annualISR / 12) * 100) / 100;
  const effectiveRate = annualIncome > 0 ? ((annualISR / annualIncome) * 100).toFixed(2) : "0.00";

  const formatQ = (n: number) => `Q ${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">{t.isrCalc.monthlyIncome}</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/40">Q</span>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-xl bg-white/5 border border-white/10 pl-12 pr-4 py-4 text-2xl font-bold text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[5000, 10000, 15000, 25000, 50000].map((v) => (
            <button
              key={v}
              onClick={() => setMonthlyIncome(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                monthlyIncome === v
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              }`}
            >
              Q {v.toLocaleString()}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/30 mt-4 leading-relaxed">{t.isrCalc.disclaimer}</p>
      </div>

      <div className="space-y-3">
        {[
          { label: t.isrCalc.annualIncome, value: formatQ(annualIncome), color: "text-white/90" },
          { label: t.isrCalc.deduction, value: `- ${formatQ(personalDeduction)}`, color: "text-red-400/80" },
          { label: t.isrCalc.taxableIncome, value: formatQ(taxableIncome), color: "text-white/70" },
          { label: t.isrCalc.annualISR, value: formatQ(annualISR), color: "text-amber-400" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-sm text-white/50">{row.label}</span>
            <span className={`text-sm font-semibold tabular-nums ${row.color}`}>{row.value}</span>
          </div>
        ))}
        <div className="rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/20 p-5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-300/70 uppercase tracking-wider font-medium">{t.isrCalc.monthlyISR}</p>
              <p className="text-3xl font-bold text-white mt-1">{formatQ(monthlyISR)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-300/70 uppercase tracking-wider font-medium">{t.isrCalc.effectiveRate}</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{effectiveRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* FAQ Accordion Item */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-white/90 pr-4">{question}</span>
        <ChevronUp className={`h-4 w-4 text-white/40 shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="px-5 text-sm text-white/50 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

/* ======================================================================
   MAIN PAGE
   ====================================================================== */
export default function LandingPage() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroBgRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const v = heroBgRef.current;
    if (!v) return;

    const tryPlay = () => {
      if (v.paused) {
        v.muted = true;
        v.play().catch(() => {});
      }
    };

    tryPlay();
    let attempts = 0;
    const interval = setInterval(() => {
      tryPlay();
      attempts++;
      if (attempts >= 10 || !v.paused) clearInterval(interval);
    }, 500);

    const onInteraction = () => {
      tryPlay();
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click", onInteraction, { once: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
  }, []);

  const featureData = [
    { icon: FileText,   ...t.features.fel, accent: "from-blue-500/15 to-blue-600/5" },
    { icon: Calculator, ...t.features.taxes, accent: "from-emerald-500/15 to-emerald-600/5" },
    { icon: BarChart3,  ...t.features.reports, accent: "from-violet-500/15 to-violet-600/5" },
    { icon: Users,      ...t.features.payroll, accent: "from-amber-500/15 to-amber-600/5" },
    { icon: Building2,  ...t.features.multiCompany, accent: "from-cyan-500/15 to-cyan-600/5" },
    { icon: Shield,     ...t.features.security, accent: "from-rose-500/15 to-rose-600/5" },
  ];

  const featureIconColors = [
    "text-blue-400 bg-blue-500/10",
    "text-emerald-400 bg-emerald-500/10",
    "text-violet-400 bg-violet-500/10",
    "text-amber-400 bg-amber-500/10",
    "text-cyan-400 bg-cyan-500/10",
    "text-rose-400 bg-rose-500/10",
  ];

  const taxItems = [
    { ...t.taxCompliance.iva, icon: Receipt },
    { ...t.taxCompliance.isr25, icon: Calculator },
    { ...t.taxCompliance.isr5, icon: TrendingUp },
    { ...t.taxCompliance.iso, icon: PiggyBank },
    { ...t.taxCompliance.igssEmployee, icon: Users },
    { ...t.taxCompliance.igssEmployer, icon: Building2 },
  ];

  const steps = [
    { num: "1", ...t.howItWorks.step1 },
    { num: "2", ...t.howItWorks.step2 },
    { num: "3", ...t.howItWorks.step3 },
  ];

  const trustSignals = [
    { icon: Shield, label: t.trust.sat, color: "text-emerald-400 bg-emerald-500/10" },
    { icon: Lock, label: t.trust.encryption, color: "text-blue-400 bg-blue-500/10" },
    { icon: CheckCircle2, label: t.trust.uptime, color: "text-violet-400 bg-violet-500/10" },
    { icon: MessageCircle, label: t.trust.support, color: "text-amber-400 bg-amber-500/10" },
  ];

  const testimonials = [t.testimonials.t1, t.testimonials.t2, t.testimonials.t3];
  const faqs = [t.faq.q1, t.faq.q2, t.faq.q3, t.faq.q4, t.faq.q5];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/5" : ""
      }`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <FiniTaxLogo size={32} textSize="text-lg" className="text-white" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-white/60 hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#taxes" className="text-white/60 hover:text-white transition-colors">{t.nav.taxes}</a>
            <a href="#calculator" className="text-white/60 hover:text-white transition-colors">Calculadora ISR</a>
            <a href="#how" className="text-white/60 hover:text-white transition-colors">{t.nav.howItWorks}</a>
            <a href="#faq" className="text-white/60 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              {t.nav.login}
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg shadow-white/10">
              {t.nav.signup}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#030712]/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.features}</a>
              <a href="#taxes" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.taxes}</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">Calculadora ISR</a>
              <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.howItWorks}</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">FAQ</a>
              <div className="pt-4 border-t border-white/10">
                <Link href="/login" className="block text-white/70 hover:text-white py-2">{t.nav.login}</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <video
          ref={heroBgRef}
          autoPlay loop muted playsInline preload="auto"
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          onLoadedData={(e) => { const v = e.currentTarget; if (v.paused) v.play().catch(() => {}); }}
          onCanPlayThrough={(e) => { const v = e.currentTarget; if (v.paused) v.play().catch(() => {}); }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/60 to-[#030712]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 mb-8 backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
              {t.hero.title1}{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-slate-300 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
              <br />
              <span className="text-white/90">{t.hero.title2}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-in-up delay-200">
              <Link href="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/30 transition-all hover:scale-[1.02]">
                {t.hero.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#calculator" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 transition-all">
                <Calculator className="h-4 w-4" />
                Calcular mi ISR
              </a>
            </div>

            <p className="text-sm text-white/30 mb-12 animate-fade-in-up delay-200">
              {t.cta.pricingHint}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/40 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400/60" /> Compatible con SAT & FEL</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-blue-400/60" /> Encriptación AES-256</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-violet-400/60" /> Leyes tributarias 2025-2026</div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/30" />
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="relative -mt-20 z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-1.5 shadow-2xl">
          <div className="rounded-xl bg-[#0c1222] overflow-hidden">
            <div className="flex items-center gap-2 p-4 pb-0 sm:p-6 sm:pb-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-white/5 flex items-center justify-center">
                <span className="text-[10px] text-white/30">app.finitax.gt/dashboard</span>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="border-y border-white/5 py-12 sm:py-16 bg-gradient-to-r from-blue-950/20 via-slate-900/20 to-blue-950/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {trustSignals.map((signal, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${signal.color}`}>
                  <signal.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-white/70">{signal.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">{t.features.title}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t.features.heading}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.features.headingHighlight}</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featureData.map((f, i) => (
              <div key={i} className={`group relative rounded-2xl border border-white/5 bg-gradient-to-br ${f.accent} p-6 sm:p-7 hover:border-white/10 transition-all duration-300`}>
                <div className="absolute top-4 right-4 text-[11px] font-bold text-white/[0.06] tabular-nums">0{i + 1}</div>
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${featureIconColors[i]} group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TAX COMPLIANCE */}
      <section id="taxes" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">{t.taxCompliance.title}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t.taxCompliance.heading}{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.taxCompliance.headingHighlight}</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">{t.taxCompliance.subtitle}</p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-white/70">{t.taxCompliance.updated}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {taxItems.map((item, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon className="h-5 w-5" />
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

      {/* ISR CALCULATOR */}
      <section id="calculator" className="py-24 sm:py-32 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">{t.isrCalc.title}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.isrCalc.heading}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.isrCalc.headingHighlight}</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg">{t.isrCalc.subtitle}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-10">
            <ISRCalculator />
          </div>
          <div className="text-center mt-8">
            <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Crear cuenta gratis para cálculos más detallados
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-widest mb-3">{t.howItWorks.title}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.howItWorks.heading}{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{t.howItWorks.headingHighlight}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/45">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px bg-gradient-to-r from-white/10 to-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.testimonials.title}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-7 hover:border-white/10 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{test.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-bold text-white/60">
                    {test.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{test.name}</p>
                    <p className="text-xs text-white/40">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-white/25 mt-12">
            Usado por contadores y empresas en Ciudad de Guatemala, Quetzaltenango, Antigua y más
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.faq.title}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-400" />
            {t.cta.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {t.cta.heading}{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-slate-300 bg-clip-text text-transparent">
              {t.cta.headingHighlight}
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-4">{t.cta.subtitle}</p>
          <p className="text-sm text-white/30 mb-10">{t.cta.pricingHint}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-gray-900 px-8 py-4 text-base font-semibold hover:bg-gray-100 transition-all shadow-xl shadow-white/10 hover:scale-[1.02]">
              {t.cta.button}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 transition-all">
              {t.cta.buttonSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10">
            <div className="lg:col-span-1">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <FiniTaxLogo size={28} textSize="text-base" className="text-white/60" />
              </Link>
              <p className="text-sm text-white/30 mt-3 leading-relaxed">
                Plataforma fiscal y contable diseñada para las leyes tributarias de Guatemala.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60 mb-4">{t.footer.product}</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-white/30 hover:text-white/60 transition-colors">{t.footer.features}</a>
                <Link href="/precios" className="block text-sm text-white/30 hover:text-white/60 transition-colors">{t.footer.pricing}</Link>
                <a href="#calculator" className="block text-sm text-white/30 hover:text-white/60 transition-colors">Calculadora ISR</a>
                <a href="#faq" className="block text-sm text-white/30 hover:text-white/60 transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60 mb-4">{t.footer.legal}</p>
              <div className="space-y-2.5">
                <Link href="/privacidad" className="block text-sm text-white/30 hover:text-white/60 transition-colors">{t.footer.privacy}</Link>
                <Link href="/terminos" className="block text-sm text-white/30 hover:text-white/60 transition-colors">{t.footer.terms}</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60 mb-4">{t.footer.contact}</p>
              <div className="space-y-2.5">
                <a href="https://wa.me/50212345678" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
                  <MessageCircle className="h-4 w-4" /> {t.footer.whatsapp}
                </a>
                <a href="mailto:info@finitaxgt.com" className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
                  <Mail className="h-4 w-4" /> {t.footer.email}
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">© {new Date().getFullYear()} Fini Tax GT</p>
            <p className="text-sm text-white/20">{t.footer.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
