"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { runPayroll } from "@/app/actions/payroll";
import { useOrg } from "@/components/dashboard/shell";

export default function NewPayrollRunPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  async function handleSubmit(formData: FormData) {
    setError("");
    // Build period dates from year/month
    const y = parseInt(formData.get("year") as string);
    const m = parseInt(formData.get("month") as string);
    const periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    formData.set("organization_id", currentOrg.id);
    formData.set("period_start", periodStart);
    formData.set("period_end", periodEnd);
    formData.set("period_label", `Nómina ${String(m).padStart(2, "0")}/${y}`);
    const result = await runPayroll(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/payroll");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ejecutar Nómina</h1>
        <p className="text-muted-foreground">Calcular planilla mensual para todos los empleados activos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input id="year" name="year" type="number" min="2020" max="2030" required defaultValue={year} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Mes *</Label>
                <Input id="month" name="month" type="number" min="1" max="12" required defaultValue={month} />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
              <p className="font-semibold">El cálculo incluye:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>IGSS empleado: 4.83%</li>
                <li>IGSS patronal: 10.67%</li>
                <li>IRTRA: 1% patronal</li>
                <li>INTECAP: 1% patronal</li>
                <li>ISR mensual según tabla (exento Q48,000/año)</li>
                <li>Provisiones: Aguinaldo, Bono 14, Vacaciones, Indemnización</li>
              </ul>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Calcular y Ejecutar Nómina</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
