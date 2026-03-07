"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployee } from "@/app/actions/payroll";
import { useOrg } from "@/components/dashboard/shell";

export default function NewEmployeePage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    formData.set("organization_id", currentOrg.id);
    const result = await createEmployee(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/payroll");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Empleado</h1>
        <p className="text-muted-foreground">Registrar empleado para nómina</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre(s) *</Label>
                <Input id="first_name" name="first_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido(s) *</Label>
                <Input id="last_name" name="last_name" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dpi_number">DPI *</Label>
                <Input id="dpi_number" name="dpi_number" required maxLength={13} placeholder="13 dígitos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit_number">NIT</Label>
                <Input id="nit_number" name="nit_number" placeholder="12345678-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="igss_affiliation">No. Afiliación IGSS</Label>
              <Input id="igss_affiliation" name="igss_affiliation" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Puesto</Label>
                <Input id="position" name="position" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" name="department" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="base_salary">Salario Base (GTQ) *</Label>
                <Input id="base_salary" name="base_salary" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_shift">Jornada *</Label>
                <Select name="work_shift" defaultValue="DIURNA">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIURNA">Diurna (8h)</SelectItem>
                    <SelectItem value="MIXTA">Mixta (7h)</SelectItem>
                    <SelectItem value="NOCTURNA">Nocturna (6h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">Fecha Ingreso *</Label>
                <Input id="hire_date" name="hire_date" type="date" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input id="bank_name" name="bank_name" placeholder="Ej: Banrural" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account">No. Cuenta Bancaria</Label>
                <Input id="bank_account" name="bank_account" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Registrar Empleado</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
