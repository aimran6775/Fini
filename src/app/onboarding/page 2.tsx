"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Building2, ArrowRight, ArrowLeft } from "lucide-react";

const departments = [
  "Guatemala", "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula",
  "El Progreso", "Escuintla", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa",
  "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez",
  "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createOrganization(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg rounded-2xl border-border/60 shadow-xl shadow-black/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-primary/25">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Configurar Empresa</CardTitle>
          <CardDescription>
            Paso {step} de 3 — {step === 1 ? "Datos Generales" : step === 2 ? "Régimen Fiscal" : "Ubicación"}
          </CardDescription>
          <div className="mt-4 flex gap-2 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-16 rounded-full transition-all duration-300 ${s <= step ? "gradient-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <AlertBanner variant="destructive" message={error} />}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa</Label>
                  <Input id="name" name="name" placeholder="Mi Empresa, S.A." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT</Label>
                  <Input id="nit" name="nit" placeholder="12345678-9" required />
                  <p className="text-xs text-muted-foreground">Formato: XXXXXXXX-X</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo de la Empresa</Label>
                  <Input id="email" name="email" type="email" placeholder="contabilidad@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" placeholder="+502 1234-5678" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Contribuyente</Label>
                  <Select name="contribuyente_type" defaultValue="GENERAL">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Contribuyente General</SelectItem>
                      <SelectItem value="PEQUENO">Pequeño Contribuyente</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pequeño contribuyente: ingresos anuales hasta Q150,000. Paga 5% sobre ingresos brutos.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Régimen ISR</Label>
                  <Select name="isr_regime" defaultValue="UTILIDADES">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILIDADES">Sobre Utilidades (25%)</SelectItem>
                      <SelectItem value="SIMPLIFICADO">Simplificado (5% / 7%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Utilidades: 25% sobre renta neta. Simplificado: 5% hasta Q30,000/mes, 7% excedente.
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" placeholder="6a Avenida 5-55, Zona 1" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select name="department" defaultValue="Guatemala">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipio</Label>
                  <Input id="municipality" name="municipality" placeholder="Guatemala" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} className="flex-1 rounded-xl h-11 gradient-primary border-0 text-white shadow-md shadow-primary/25">
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-11 gradient-primary border-0 text-white shadow-md shadow-primary/25">
                  {loading ? <Spinner size="sm" /> : <>Crear Empresa <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
