import Link from "next/link";
import { FiniTaxLogo } from "@/components/logo";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios — FiniTax GT",
  description: "Planes y precios de FiniTax Guatemala. Contabilidad, facturación FEL y planilla para empresas guatemaltecas.",
};

const plans = [
  {
    name: "Emprendedor",
    price: "Q 199",
    period: "/mes",
    description: "Para negocios pequeños y freelancers",
    highlight: false,
    features: [
      "Hasta 50 facturas FEL/mes",
      "1 usuario",
      "1 empresa",
      "Control de gastos",
      "Reportes básicos (IVA, ISR)",
      "Soporte por email",
    ],
  },
  {
    name: "Profesional",
    price: "Q 499",
    period: "/mes",
    description: "Para PYMES y contadores independientes",
    highlight: true,
    features: [
      "Facturas FEL ilimitadas",
      "Hasta 5 usuarios",
      "Hasta 3 empresas",
      "Planilla (hasta 25 empleados)",
      "Importación con IA",
      "Todos los reportes financieros",
      "Conciliación bancaria",
      "Control de inventario",
      "Soporte prioritario",
    ],
  },
  {
    name: "Empresarial",
    price: "Q 999",
    period: "/mes",
    description: "Para empresas medianas y despachos contables",
    highlight: false,
    features: [
      "Todo en Profesional",
      "Usuarios ilimitados",
      "Empresas ilimitadas",
      "Empleados ilimitados",
      "Asistente IA avanzado",
      "API de integración",
      "Auditoría y RBAC completo",
      "Activos fijos y depreciación",
      "Presupuestos y metas",
      "Soporte dedicado 24/7",
    ],
  },
];

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <FiniTaxLogo size={28} textSize="text-base" className="text-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-white text-gray-900 px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition-all">
              Empezar Gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            14 días gratis en todos los planes
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Precios simples,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              sin sorpresas
            </span>
          </h1>
          <p className="text-lg text-white/50">
            Todos los impuestos de Guatemala en una sola plataforma. IVA, ISR, ISO, IGSS, IRTRA, INTECAP — todo incluido.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? "border-blue-500/50 bg-gradient-to-b from-blue-950/40 to-transparent shadow-lg shadow-blue-500/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-white/40 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-blue-400" : "text-emerald-400"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02]"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Empezar Prueba Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Puedo cambiar de plan en cualquier momento?",
                a: "Sí, puede actualizar o degradar su plan en cualquier momento. El cambio se aplica de inmediato y se prorratea la diferencia.",
              },
              {
                q: "¿La facturación FEL está incluida en todos los planes?",
                a: "Sí, todos los planes incluyen facturación electrónica FEL certificada por SAT. El plan Emprendedor tiene un límite de 50 facturas mensuales.",
              },
              {
                q: "¿Qué pasa con mis datos si cancelo?",
                a: "Sus datos se conservan por 30 días después de la cancelación. Los datos fiscales se mantienen el tiempo requerido por ley (4 años) de forma segura.",
              },
              {
                q: "¿Ofrecen descuento por pago anual?",
                a: "Sí, al pagar anualmente obtiene 2 meses gratis (equivalente a un 16% de descuento).",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-white/50">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <FiniTaxLogo size={24} textSize="text-sm" className="text-white/40" />
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/terminos" className="hover:text-white/60 transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-white/60 transition-colors">Privacidad</Link>
          </div>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Fini Tax GT</p>
        </div>
      </footer>
    </div>
  );
}
