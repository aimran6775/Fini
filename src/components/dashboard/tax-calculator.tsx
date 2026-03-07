"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Calculator, FileText } from "lucide-react";
import { calculateIVA, calculateISR, calculateISO, createTaxFiling } from "@/app/actions/tax";
import { formatGTQ } from "@/lib/tax-utils";
import type { TaxCalculation } from "@/lib/tax-utils";

interface TaxCalculatorProps {
  orgId: string;
  isrRegime: "UTILIDADES" | "SIMPLIFICADO";
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function TaxCalculator({ orgId, isrRegime }: TaxCalculatorProps) {
  const [taxType, setTaxType] = useState("IVA_MENSUAL");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [quarter, setQuarter] = useState(String(Math.ceil((new Date().getMonth() + 1) / 3)));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<TaxCalculation | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setResult(null);
    try {
      let calc: TaxCalculation;
      if (taxType === "IVA_MENSUAL") {
        calc = await calculateIVA(orgId, parseInt(month), parseInt(year));
      } else if (taxType === "ISR_TRIMESTRAL") {
        calc = await calculateISR(orgId, parseInt(quarter), parseInt(year), isrRegime);
      } else {
        calc = await calculateISO(orgId, parseInt(quarter), parseInt(year));
      }
      setResult(calc);
    } catch (err: any) {
      alert("Error al calcular: " + (err?.message || "Error desconocido"));
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("organization_id", orgId);
      formData.set("tax_type", result.type);
      formData.set("period", result.period);
      formData.set("taxable_base", String(result.taxableBase));
      formData.set("tax_amount", String(result.taxAmount));
      formData.set("credits", String(result.credits));
      formData.set("net_tax", String(result.netTax));
      const res = await createTaxFiling(formData);
      if (res?.error) alert(res.error);
      else {
        alert("Declaración guardada correctamente");
        setResult(null);
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || "Error desconocido"));
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" /> Calcular Impuesto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipo de Impuesto</Label>
            <Select value={taxType} onValueChange={(v) => { setTaxType(v); setResult(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IVA_MENSUAL">IVA Mensual</SelectItem>
                <SelectItem value="ISR_TRIMESTRAL">ISR Trimestral</SelectItem>
                <SelectItem value="ISO_TRIMESTRAL">ISO Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {taxType === "IVA_MENSUAL" ? (
            <div className="space-y-2">
              <Label>Mes</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Trimestre</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label>Año</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={loading}>
          {loading ? <Spinner size="sm" /> : <><Calculator className="mr-2 h-4 w-4" /> Calcular</>}
        </Button>

        {result && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <h4 className="font-semibold">{result.type} — Período {result.period}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Base Imponible:</span>
              <span className="text-right font-medium">{formatGTQ(result.taxableBase)}</span>
              <span className="text-muted-foreground">Tasa:</span>
              <span className="text-right font-medium">{(result.rate * 100).toFixed(1)}%</span>
              <span className="text-muted-foreground">Impuesto Bruto:</span>
              <span className="text-right font-medium">{formatGTQ(result.taxAmount)}</span>
              <span className="text-muted-foreground">Créditos Fiscales:</span>
              <span className="text-right font-medium text-green-600">-{formatGTQ(result.credits)}</span>
              <span className="text-muted-foreground font-bold border-t pt-1">Neto a Pagar:</span>
              <span className="text-right font-bold text-lg border-t pt-1">{formatGTQ(result.netTax)}</span>
            </div>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" /> : <><FileText className="mr-2 h-4 w-4" /> Guardar Declaración</>}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
