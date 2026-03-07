"use client";

import { useState } from "react";
import { createExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useOrg } from "@/components/dashboard/shell";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

const categories = [
  "Alquiler", "Servicios Públicos", "Suministros de Oficina", "Transporte",
  "Alimentación", "Comunicaciones", "Publicidad", "Seguros", "Mantenimiento",
  "Honorarios Profesionales", "Capacitación", "Equipo", "Software",
  "Impuestos y Tasas", "Gastos Bancarios", "Otros",
];

export default function NewExpensePage() {
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taxDeductible, setTaxDeductible] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set("organization_id", currentOrg.id);
    form.set("is_deductible", taxDeductible ? "true" : "false");
    // Auto-calculate IVA (12% included in price)
    const amount = parseFloat(form.get("amount") as string) || 0;
    form.set("iva_amount", String(Math.round((amount - amount / 1.12) * 100) / 100));

    const result = await createExpense(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Registrar Gasto</h1>
          <p className="text-muted-foreground">Agrega un nuevo gasto operativo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <AlertBanner variant="destructive" message={error} />}

        <Card>
          <CardHeader><CardTitle>Detalle del Gasto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense_date">Fecha</Label>
                <Input id="expense_date" name="expense_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto (GTQ)</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" placeholder="Descripción del gasto" required />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select name="category" defaultValue="Otros">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt_number">No. Factura / Recibo</Label>
              <Input id="receipt_number" name="receipt_number" placeholder="Opcional" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>¿Es deducible de ISR?</Label>
                <p className="text-xs text-muted-foreground">
                  Marcar si el gasto es deducible para efectos del ISR
                </p>
              </div>
              <Switch checked={taxDeductible} onCheckedChange={setTaxDeductible} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" placeholder="Notas opcionales..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/expenses"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" /> Guardar Gasto</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
