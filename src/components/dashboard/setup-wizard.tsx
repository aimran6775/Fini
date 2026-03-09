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
  Building2, FileText, MapPin, ArrowRight, ArrowLeft,
  CheckCircle2, Sparkles,
} from "lucide-react";

const DEPARTMENTS = [
  "Guatemala", "Alta Verapaz", "Baja Verapaz", "Chimaltenango",
  "Chiquimula", "El Progreso", "Escuintla", "Huehuetenango",
  "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango",
  "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos",
  "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa",
];

const STEPS = [
  { num: 1, label: "Datos de Empresa", icon: Building2 },
  { num: 2, label: "Régimen Fiscal", icon: FileText },
  { num: 3, label: "Dirección", icon: MapPin },
];

export function SetupWizard({ userName }: { userName?: string }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contribuyenteType, setContribuyenteType] = useState("GENERAL");
  const [isrRegime, setIsrRegime] = useState("UTILIDADES");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [municipality, setMunicipality] = useState("");

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0 && nit.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("nit", nit);
      formData.set("email", email);
      formData.set("phone", phone);
      formData.set("contribuyente_type", contribuyenteType);
      formData.set("isr_regime", isrRegime);
      formData.set("address", address);
      formData.set("department", department);
      formData.set("municipality", municipality);

      const result = await createOrganization(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      // revalidatePath already called in action — layout will re-render with org
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <FiniTaxLogo size={42} textSize="text-xl" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Configuración Inicial
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {userName ? `¡Hola, ${userName}!` : "¡Bienvenido!"} Configura tu Empresa
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Completa estos datos para comenzar a usar FiniTax Guatemala.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
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
                {s.num < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${s.num < step ? "bg-emerald-300" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          {error && <div className="mb-6"><AlertBanner variant="destructive" message={error} /></div>}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre de la Empresa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Mi Empresa, S.A."
                  className="h-12 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit" className="text-sm font-medium">
                  NIT <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nit"
                  placeholder="12345678-9"
                  className="h-12 rounded-xl"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Número de Identificación Tributaria asignado por SAT
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo de Empresa</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@empresa.com"
                    className="h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+502 2345-6789"
                    className="h-12 rounded-xl"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tax Regime */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de Contribuyente</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "GENERAL", label: "General", desc: "Obligado a IVA y FEL" },
                    { value: "PEQUEÑO", label: "Pequeño", desc: "Régimen simplificado" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setContribuyenteType(opt.value)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        contribuyenteType === opt.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Régimen de ISR</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "UTILIDADES", label: "Sobre Utilidades", desc: "25% sobre utilidad neta" },
                    { value: "SIMPLIFICADO", label: "Simplificado", desc: "5% / 7% sobre ingresos" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIsrRegime(opt.value)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        isrRegime === opt.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Dirección Fiscal</Label>
                <Input
                  id="address"
                  placeholder="5a Avenida 10-20, Zona 1"
                  className="h-12 rounded-xl"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Departamento</Label>
                <select
                  id="department"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Seleccionar departamento...</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm font-medium">Municipio</Label>
                <Input
                  id="municipality"
                  placeholder="Guatemala"
                  className="h-12 rounded-xl"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="rounded-xl gap-2"
              >
                <ArrowLeft className="h-4 w-4" />Anterior
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="rounded-xl gradient-primary border-0 text-white gap-2 shadow-md shadow-primary/25"
              >
                Siguiente<ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending || !canAdvance()}
                className="rounded-xl gradient-primary border-0 text-white gap-2 shadow-md shadow-primary/25"
              >
                {isPending ? <Spinner size="sm" /> : <><CheckCircle2 className="h-4 w-4" />Crear Empresa</>}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Podrás editar estos datos después en Configuración.
        </p>
      </div>
    </div>
  );
}
