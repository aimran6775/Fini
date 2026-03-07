"use client";

import { useState } from "react";
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

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Configurar Empresa</CardTitle>
          <CardDescription>
            Paso {step} de 3 — {step === 1 ? "Datos Generales" : step === 2 ? "Régimen Fiscal" : "Ubicación"}
          </CardDescription>
          <div className="mt-3 flex gap-1 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-12 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
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

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)} className="flex-1">
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="flex-1">
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
