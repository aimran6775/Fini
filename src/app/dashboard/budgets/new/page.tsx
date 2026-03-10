"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { useOrg } from "@/components/dashboard/shell";
import { createBudget } from "@/app/actions/accounting";
import { getChartOfAccounts } from "@/app/actions/accounting";

export default function NewBudgetPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [periodType, setPeriodType] = useState("MONTHLY");

  useEffect(() => {
    if (currentOrg?.id) {
      getChartOfAccounts(currentOrg.id).then(setAccounts).catch(() => {});
    }
  }, [currentOrg?.id]);

  async function handleSubmit(formData: FormData) {
    setError("");
    formData.set("organization_id", currentOrg.id);
    formData.set("period_type", periodType);
    const result = await createBudget(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/budgets");
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Presupuesto</h1>
        <p className="text-muted-foreground">Crear presupuesto para controlar gastos e ingresos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cuenta Contable *</Label>
              <Select name="account_id">
                <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_code} — {a.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Período *</Label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Año *</Label>
                <Select name="period_year" defaultValue={String(currentYear)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {periodType === "MONTHLY" && (
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select name="period_month">
                  <SelectTrigger><SelectValue placeholder="Seleccionar mes" /></SelectTrigger>
                  <SelectContent>
                    {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {periodType === "QUARTERLY" && (
              <div className="space-y-2">
                <Label>Trimestre</Label>
                <Select name="period_quarter">
                  <SelectTrigger><SelectValue placeholder="Seleccionar trimestre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Ene-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Abr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="budgeted_amount">Monto Presupuestado (GTQ) *</Label>
              <Input id="budgeted_amount" name="budgeted_amount" type="number" step="0.01" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" placeholder="Observaciones del presupuesto..." />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Crear Presupuesto</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
