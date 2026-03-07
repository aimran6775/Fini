"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { updateExpense } from "@/app/actions/expenses";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [expenseId, setExpenseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [taxType, setTaxType] = useState("GRAVADA");
  const [isDeductible, setIsDeductible] = useState(true);
  const [deductionCategory, setDeductionCategory] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [supplierNit, setSupplierNit] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [felUuid, setFelUuid] = useState("");
  const [felSerie, setFelSerie] = useState("");
  const [felNumero, setFelNumero] = useState("");
  const [currency, setCurrency] = useState("GTQ");

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setExpenseId(id);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (!data || data.status !== "DRAFT") {
        router.push(`/dashboard/expenses/${id}`);
        return;
      }

      setDescription(data.description);
      setAmount(Number(data.amount));
      setExpenseDate(data.expense_date);
      setCategory(data.category || "");
      setTaxType(data.tax_type);
      setIsDeductible(data.is_deductible);
      setDeductionCategory(data.deduction_category || "");
      setHasReceipt(data.has_receipt);
      setSupplierNit(data.supplier_nit || "");
      setSupplierName(data.supplier_name || "");
      setFelUuid(data.fel_uuid || "");
      setFelSerie(data.fel_serie || "");
      setFelNumero(data.fel_numero || "");
      setCurrency(data.currency);
      setLoading(false);
    }
    load();
  }, [params, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("description", description);
    formData.set("amount", String(amount));
    formData.set("expense_date", expenseDate);
    formData.set("category", category);
    formData.set("tax_type", taxType);
    formData.set("is_deductible", String(isDeductible));
    formData.set("deduction_category", deductionCategory);
    formData.set("has_receipt", String(hasReceipt));
    formData.set("supplier_nit", supplierNit);
    formData.set("supplier_name", supplierName);
    formData.set("fel_uuid", felUuid);
    formData.set("fel_serie", felSerie);
    formData.set("fel_numero", felNumero);
    formData.set("currency", currency);

    const result = await updateExpense(expenseId, formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const ivaAmount = taxType === "GRAVADA" ? Math.round((amount - amount / 1.12) * 100) / 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/expenses/${expenseId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Gasto</h1>
          <p className="text-muted-foreground">Modifica los datos del gasto pendiente</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información del Gasto</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
              <Label>Monto</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} required />
              {taxType === "GRAVADA" && amount > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">IVA incluido: Q{ivaAmount.toFixed(2)}</p>
              )}
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
            </div>
            <div>
              <Label>Categoría</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="Servicios">Servicios</option>
                <option value="Suministros">Suministros</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Transporte">Transporte</option>
                <option value="Combustible">Combustible</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Comunicaciones">Comunicaciones</option>
                <option value="Seguros">Seguros</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <Label>Tipo Impositivo</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
              >
                <option value="GRAVADA">Gravada (IVA 12%)</option>
                <option value="EXENTA">Exenta</option>
                <option value="NO_SUJETA">No Sujeta</option>
              </select>
            </div>
            <div>
              <Label>Moneda</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GTQ">GTQ — Quetzal</option>
                <option value="USD">USD — Dólar</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="deductible" checked={isDeductible} onChange={(e) => setIsDeductible(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="deductible">Gasto Deducible</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Proveedor y Comprobante</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre del Proveedor</Label>
              <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
            <div>
              <Label>NIT Proveedor</Label>
              <Input value={supplierNit} onChange={(e) => setSupplierNit(e.target.value)} placeholder="1234567-8" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="receipt" checked={hasReceipt} onChange={(e) => setHasReceipt(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="receipt">Tiene Comprobante/Factura</Label>
            </div>
            <div>
              <Label>UUID FEL del Comprobante</Label>
              <Input value={felUuid} onChange={(e) => setFelUuid(e.target.value)} placeholder="UUID de la factura del proveedor" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/expenses/${expenseId}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
