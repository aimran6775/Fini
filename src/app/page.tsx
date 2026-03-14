"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiniTaxLogo } from "@/components/logo";
import { useLanguage } from "@/lib/i18n";
import {
  FileText, BarChart3, Shield, Users, Building2, Calculator,
  ArrowRight, ChevronDown, CheckCircle2, TrendingUp,
  Globe2, Lock, Star, Sparkles, Receipt, PiggyBank,
  Menu, X, Languages,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

/* Animated counter */
function CountUp({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(target * eased);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}</span>;
}

/* Language Toggle */
function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  
  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
      title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{lang === "es" ? "EN" : "ES"}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Feature icons mapping
  const featureData = [
    { icon: FileText,   ...t.features.fel },
    { icon: Calculator, ...t.features.taxes },
    { icon: BarChart3,  ...t.features.reports },
    { icon: Users,      ...t.features.payroll },
    { icon: Building2,  ...t.features.multiCompany },
    { icon: Shield,     ...t.features.security },
  ];

  // Tax items
  const taxItems = [
    { ...t.taxCompliance.iva, icon: Receipt },
    { ...t.taxCompliance.isr25, icon: Calculator },
    { ...t.taxCompliance.isr5, icon: TrendingUp },
    { ...t.taxCompliance.iso, icon: PiggyBank },
    { ...t.taxCompliance.igssEmployee, icon: Users },
    { ...t.taxCompliance.igssEmployer, icon: Building2 },
  ];

  // Steps
  const steps = [
    { num: "1", ...t.howItWorks.step1 },
    { num: "2", ...t.howItWorks.step2 },
    { num: "3", ...t.howItWorks.step3 },
  ];

  // Stats
  const stats = [
    { value: 2500, suffix: "+", label: t.stats.companies },
    { value: 150, suffix: "K+", label: t.stats.invoices },
    { value: 99.9, suffix: "%", label: t.stats.uptime },
    { value: 24, suffix: "/7", label: t.stats.support },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#030712]/80 backdrop-blur-xl border-b border-white/5" : ""
      }`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <FiniTaxLogo size={32} textSize="text-lg" className="text-white" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-white/60 hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#taxes" className="text-white/60 hover:text-white transition-colors">{t.nav.taxes}</a>
            <a href="#how" className="text-white/60 hover:text-white transition-colors">{t.nav.howItWorks}</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <LanguageToggle />
            
            <Link href="/login" className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              {t.nav.login}
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg shadow-white/10">
              {t.nav.signup}
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#030712]/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.features}</a>
              <a href="#taxes" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.taxes}</a>
              <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block text-white/70 hover:text-white py-2">{t.nav.howItWorks}</a>
              <div className="pt-4 border-t border-white/10">
                <Link href="/login" className="block text-white/70 hover:text-white py-2">{t.nav.login}</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero.mp4"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/60 to-[#030712]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 mb-8 backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
              {t.hero.title1}{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
              <br />
              <span className="text-white/90">{t.hero.title2}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up delay-200">
              <Link href="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]">
                {t.hero.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 transition-all">
                {t.hero.ctaSecondary}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/40 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> {t.hero.trustSsl}</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> {t.hero.trustSat}</div>
              <div className="flex items-center gap-2"><Globe2 className="h-4 w-4" /> {t.hero.trustGuatemala}</div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/30" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DASHBOARD PREVIEW
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-20 z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-1.5 shadow-2xl">
          <div className="rounded-xl bg-[#0c0c1a] overflow-hidden">
            {/* Browser chrome header */}
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
            
            {/* Product demo video */}
            <div className="p-3 sm:p-4">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg"
                src="/videos/hero.mp4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/5 py-12 sm:py-16 bg-gradient-to-r from-indigo-950/30 via-purple-950/30 to-indigo-950/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  <CountUp target={stat.value} suffix={stat.suffix} decimals={stat.suffix === "%" ? 1 : 0} />
                </p>
                <p className="mt-1 text-sm text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">{t.features.title}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t.features.heading}{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{t.features.headingHighlight}</span>
            </h2>
            <p className="mt-4 text-white/50 text-lg">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featureData.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-7 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-300">
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

      {/* ═══════════════════════════════════════════════════════════
          TAX COMPLIANCE
          ═══════════════════════════════════════════════════════════ */}
      <section id="taxes" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">{t.taxCompliance.title}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t.taxCompliance.heading}{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.taxCompliance.headingHighlight}</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                {t.taxCompliance.subtitle}
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-white/70">{t.taxCompliance.updated}</p>
              </div>
            </div>

            {/* Right - Tax items grid */}
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

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="py-24 sm:py-32 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
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
                <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/45">{step.desc}</p>
                
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px bg-gradient-to-r from-white/10 to-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 mb-8 backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-400" />
            {t.cta.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {t.cta.heading}{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.cta.headingHighlight}
            </span>
          </h2>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            {t.cta.subtitle}
          </p>

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

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <FiniTaxLogo size={28} textSize="text-base" className="text-white/60" />
            </Link>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-white/60 transition-colors">{t.footer.terms}</a>
              <a href="#" className="hover:text-white/60 transition-colors">{t.footer.contact}</a>
            </div>
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} Fini Tax GT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
