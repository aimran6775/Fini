import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Receipt, Calculator, Users, Building2, BarChart3, Bot,
  Shield, FileText, ArrowRight, CheckCircle2, Landmark, Wallet
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Facturación FEL",
    description: "Emite FACT, FCAM, FPEQ, FCAP, notas de crédito/débito y recibos electrónicos certificados por SAT.",
  },
  {
    icon: Calculator,
    title: "Motor de Impuestos",
    description: "ISR (Utilidades 25% o Simplificado 5%/7%), IVA 12%, ISO 1%, retenciones y timbre fiscal automático.",
  },
  {
    icon: Users,
    title: "Planilla y IGSS",
    description: "Nómina completa con IGSS (4.83%/10.67%), IRTRA 1%, INTECAP 1%, Aguinaldo, Bono 14, vacaciones.",
  },
  {
    icon: Landmark,
    title: "Contabilidad",
    description: "Plan de cuentas guatemalteco, partidas de diario, libro mayor, estados financieros y conciliación bancaria.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Análisis",
    description: "Balance general, estado de resultados, flujo de caja, presupuestos y proyecciones en tiempo real.",
  },
  {
    icon: Bot,
    title: "Asistente IA Fiscal",
    description: "Consulta tus dudas sobre leyes tributarias guatemaltecas. Respuestas precisas con referencia legal.",
  },
  {
    icon: Wallet,
    title: "Gestión de Gastos",
    description: "Categorización automática, aprobaciones, adjuntos de facturas y deducibilidad fiscal.",
  },
  {
    icon: Shield,
    title: "Seguridad y Auditoría",
    description: "Roles y permisos granulares, bitácora de auditoría, cifrado de datos y cumplimiento SAT.",
  },
  {
    icon: FileText,
    title: "Activos Fijos",
    description: "Depreciación automática (edificios 5%, vehículos 20%, equipo 20%, software 33.33%).",
  },
];

const taxHighlights = [
  "IVA 12% — Crédito y Débito Fiscal automático",
  "ISR Régimen sobre Utilidades (25%) o Simplificado (5%/7%)",
  "ISO 1% trimestral sobre activos netos o ingresos brutos",
  "IGSS patronal 10.67% + IRTRA 1% + INTECAP 1%",
  "Retenciones ISR: 5% servicios, 6% bienes, 15% no domiciliados",
  "Timbre Fiscal 3% sobre documentos no afectos al IVA",
  "Depreciación fiscal según Decreto 10-2012",
  "FEL obligatorio — 10 tipos de documento electrónico",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              F
            </div>
            <span className="text-xl font-bold">
              Fini<span className="text-primary">Tax</span>{" "}
              <span className="text-sm font-normal text-muted-foreground">Guatemala</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button>
                Crear Cuenta <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800">
            <Building2 className="h-4 w-4" />
            Para empresas guatemaltecas
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Contabilidad e Impuestos{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Todo en Uno
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            FiniTax es la plataforma más completa para gestionar tu contabilidad, facturación FEL,
            planilla, impuestos ISR/IVA/ISO y finanzas. Cumple con SAT sin esfuerzo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Ver Funcionalidades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tax Highlights */}
      <section className="border-y bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Cumplimiento Fiscal Guatemalteco Completo
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            {taxHighlights.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Todo lo que Necesitas</h2>
          <p className="mt-3 text-muted-foreground">
            De la facturación a la declaración — una plataforma para toda tu operación financiera.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Comienza Hoy con FiniTax Guatemala</h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Registra tu empresa, configura tu NIT y régimen ISR, y empieza a facturar en minutos.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base">
              Crear Cuenta Gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FiniTax Guatemala. Todos los derechos reservados.</p>
          <p className="mt-1">
            Cumplimiento SAT • FEL Certificado • ISR • IVA • ISO • IGSS
          </p>
        </div>
      </footer>
    </div>
  );
}
