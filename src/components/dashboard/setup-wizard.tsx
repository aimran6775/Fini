"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FiniTaxLogo } from "@/components/logo";
import {
  Building2, User, FileText, MapPin, ArrowRight, ArrowLeft,
  CheckCircle2, Sparkles, Calculator, Briefcase,
} from "lucide-react";

const DEPARTMENTS = [
  "Guatemala", "Alta Verapaz", "Baja Verapaz", "Chimaltenango",
  "Chiquimula", "El Progreso", "Escuintla", "Huehuetenango",
  "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango",
  "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos",
  "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa",
];

type AccountType = "personal" | "business" | null;

export function SetupWizard({ userName }: { userName?: string }) {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [step, setStep] = useState(0); // 0 = choose type, 1+ = wizard steps
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [dpi, setDpi] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contribuyenteType, setContribuyenteType] = useState("PEQUEÑO");
  const [isrRegime, setIsrRegime] = useState("SIMPLIFICADO");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");

  const totalSteps = accountType === "personal" ? 2 : 3;

  const canAdvance = () => {
    if (step === 1) {
      if (accountType === "personal") {
        return name.trim().length > 0 && (nit.trim().length > 0 || dpi.trim().length > 0);
      }
      return name.trim().length > 0 && nit.trim().length > 0;
    }
    return true;
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      
      if (accountType === "personal") {
        formData.set("name", name);
        formData.set("nit", nit || "CF");
        formData.set("contribuyente_type", "PEQUEÑO");
        formData.set("isr_regime", "SIMPLIFICADO");
      } else {
        formData.set("name", name);
        formData.set("nit", nit);
        formData.set("contribuyente_type", contribuyenteType);
        formData.set("isr_regime", isrRegime);
      }
      
      formData.set("email", email);
      formData.set("phone", phone);
      formData.set("address", address);
      formData.set("department", department);
      formData.set("municipality", municipality);

      const result = await createOrganization(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  // Step 0: Choose account type
  if (step === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <FiniTaxLogo size={42} textSize="text-xl" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              ¡Bienvenido a Fini Tax!
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {userName ? `¡Hola, ${userName}!` : "¡Hola!"} ¿Cómo usarás Fini Tax?
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Elige la opción que mejor describe tu situación
            </p>
          </div>

          <div className="grid gap-4">
            {/* Personal Option */}
            <button
              onClick={() => { setAccountType("personal"); setStep(1); }}
              className="group rounded-2xl border-2 bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20 transition-colors">
                  <User className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Personal</h3>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      Individuos
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Para personas que quieren calcular y declarar sus impuestos personales, 
                    llevar control de ingresos/gastos, o trabajar como freelancer.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["ISR Personal", "Gastos Deducibles", "Retenciones"].map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </button>

            {/* Business Option */}
            <button
              onClick={() => { setAccountType("business"); setStep(1); }}
              className="group rounded-2xl border-2 bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20 transition-colors">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Empresa</h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Negocios
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Para empresas y negocios que necesitan facturación FEL, contabilidad completa, 
                    planilla, IVA, ISR e informes financieros.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Facturación FEL", "Contabilidad", "Planilla", "IVA/ISR"].map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Podrás cambiar esto después en Configuración
          </p>
        </div>
      </div>
    );
  }

  const personalSteps = [
    { num: 1, label: "Tus Datos", icon: User },
    { num: 2, label: "Dirección", icon: MapPin },
  ];

  const businessSteps = [
    { num: 1, label: "Datos de Empresa", icon: Building2 },
    { num: 2, label: "Régimen Fiscal", icon: FileText },
    { num: 3, label: "Dirección", icon: MapPin },
  ];

  const steps = accountType === "personal" ? personalSteps : businessSteps;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <FiniTaxLogo size={42} textSize="text-xl" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            {accountType === "personal" ? (
              <><Calculator className="h-3.5 w-3.5" /> Cuenta Personal</>
            ) : (
              <><Briefcase className="h-3.5 w-3.5" /> Cuenta Empresarial</>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {accountType === "personal" ? "Configura tu perfil" : "Configura tu empresa"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {accountType === "personal" 
              ? "Necesitamos algunos datos para calcular tus impuestos"
              : "Completa estos datos para comenzar a usar Fini Tax"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => { setStep(0); setAccountType(null); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Cambiar tipo
          </button>
          <div className="h-4 w-px bg-border mx-2" />
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  s.num === step
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : s.num < step
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 ${s.num < step ? "bg-emerald-300" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {error && <div className="mb-6"><AlertBanner variant="destructive" message={error} /></div>}

          {accountType === "personal" && step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tu Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input id="name" placeholder="Juan García López" className="h-12 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nit" className="text-sm font-medium">NIT</Label>
                  <Input id="nit" placeholder="12345678-9" className="h-12 rounded-xl" value={nit} onChange={(e) => setNit(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Opcional si tienes DPI</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpi" className="text-sm font-medium">DPI</Label>
                  <Input id="dpi" placeholder="1234 56789 0123" className="h-12 rounded-xl" value={dpi} onChange={(e) => setDpi(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Documento Personal</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo</Label>
                  <Input id="email" type="email" placeholder="correo@gmail.com" className="h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                  <Input id="phone" placeholder="+502 1234-5678" className="h-12 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {accountType === "personal" && step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                <Input id="address" placeholder="5a Avenida 10-20, Zona 1" className="h-12 rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Departamento</Label>
                <select id="department" className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm font-medium">Municipio</Label>
                <Input id="municipality" placeholder="Guatemala" className="h-12 rounded-xl" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
              </div>
            </div>
          )}

          {accountType === "business" && step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nombre de la Empresa <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="Mi Empresa, S.A." className="h-12 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit" className="text-sm font-medium">NIT <span className="text-destructive">*</span></Label>
                <Input id="nit" placeholder="12345678-9" className="h-12 rounded-xl" value={nit} onChange={(e) => setNit(e.target.value)} required />
                <p className="text-xs text-muted-foreground">Número de Identificación Tributaria asignado por SAT</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo de Empresa</Label>
                  <Input id="email" type="email" placeholder="info@empresa.com" className="h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                  <Input id="phone" placeholder="+502 2345-6789" className="h-12 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {accountType === "business" && step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de Contribuyente</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {[{ value: "GENERAL", label: "General", desc: "Obligado a IVA y FEL" }, { value: "PEQUEÑO", label: "Pequeño", desc: "Régimen simplificado" }].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setContribuyenteType(opt.value)} className={`rounded-xl border p-4 text-left transition-all ${contribuyenteType === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Régimen de ISR</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {[{ value: "UTILIDADES", label: "Sobre Utilidades", desc: "25% sobre utilidad neta" }, { value: "SIMPLIFICADO", label: "Simplificado", desc: "5% / 7% sobre ingresos" }].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setIsrRegime(opt.value)} className={`rounded-xl border p-4 text-left transition-all ${isrRegime === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {accountType === "business" && step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Dirección Fiscal</Label>
                <Input id="address" placeholder="5a Avenida 10-20, Zona 1" className="h-12 rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Departamento</Label>
                <select id="department" className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm font-medium">Municipio</Label>
                <Input id="municipality" placeholder="Guatemala" className="h-12 rounded-xl" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" />Anterior
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => { setStep(0); setAccountType(null); }} className="rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" />Cambiar tipo
              </Button>
            )}

            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()} className="rounded-xl gradient-primary border-0 text-white gap-2 shadow-md shadow-primary/25">
                Siguiente<ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isPending || !canAdvance()} className="rounded-xl gradient-primary border-0 text-white gap-2 shadow-md shadow-primary/25">
                {isPending ? <Spinner size="sm" /> : <><CheckCircle2 className="h-4 w-4" />{accountType === "personal" ? "Crear Perfil" : "Crear Empresa"}</>}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">Podrás editar estos datos después en Configuración</p>
      </div>
    </div>
  );
}
