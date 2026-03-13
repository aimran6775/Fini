"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Calculator, Save, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatGTQ, TAX_RATES } from "@/lib/tax-utils";
import { calculatePersonalTax, savePersonalTaxReturn, type PersonalTaxSummary } from "@/app/actions/personal-tax";

interface PersonalTaxCalculatorProps {
  orgId: string;
  year: number;
  initialSummary: PersonalTaxSummary;
}

export function PersonalTaxCalculator({ orgId, year, initialSummary }: PersonalTaxCalculatorProps) {
  const [summary, setSummary] = useState<PersonalTaxSummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleRecalculate() {
    setLoading(true);
    setSaved(false);
    try {
      const newSummary = await calculatePersonalTax(orgId, year);
      setSummary(newSummary);
    } catch (err: any) {
      alert("Error al calcular: " + (err?.message || "Error desconocido"));
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await savePersonalTaxReturn(orgId, year);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        setSaved(true);
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || "Error desconocido"));
    }
    setSaving(false);
  }

  const isrResult = summary.calculation.isrAPagar > 0 
    ? { type: "pagar" as const, amount: summary.calculation.isrAPagar }
    : { type: "favor" as const, amount: summary.calculation.isrAFavor };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora ISR Personal — {year}
          </CardTitle>
          <CardDescription>
            Calcula tu Impuesto Sobre la Renta anual basado en tus ingresos y deducciones registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax rates info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tasas ISR Rentas de Trabajo (Guatemala)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Hasta Q{TAX_RATES.ISR_EMPLOYEE_THRESHOLD.toLocaleString()}</p>
                <p className="font-bold text-blue-900">{(TAX_RATES.ISR_EMPLOYEE_LOW * 100)}%</p>
              </div>
              <div>
                <p className="text-blue-700">Excedente sobre Q{TAX_RATES.ISR_EMPLOYEE_THRESHOLD.toLocaleString()}</p>
                <p className="font-bold text-blue-900">{(TAX_RATES.ISR_EMPLOYEE_HIGH * 100)}%</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              * Deducción fija anual de Q{TAX_RATES.ISR_EMPLOYEE_DEDUCTION.toLocaleString()} aplicada automáticamente
            </p>
          </div>

          {/* Calculation breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold">Desglose del Cálculo</h4>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left column - Income & Deductions */}
              <div className="space-y-3 rounded-lg border p-4">
                <h5 className="font-medium text-sm text-muted-foreground">INGRESOS</h5>
                
                <div className="flex justify-between text-sm">
                  <span>Trabajo Dependiente</span>
                  <span>{formatGTQ(summary.income.trabajoDependiente)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trabajo Independiente</span>
                  <span>{formatGTQ(summary.income.trabajoIndependiente)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Capital Mobiliario</span>
                  <span>{formatGTQ(summary.income.capitalMobiliario)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Capital Inmobiliario</span>
                  <span>{formatGTQ(summary.income.capitalInmobiliario)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ganancias de Capital</span>
                  <span>{formatGTQ(summary.income.gananciasCapital)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Otros Ingresos</span>
                  <span>{formatGTQ(summary.income.otros)}</span>
                </div>
                
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Ingresos Brutos</span>
                  <span className="text-green-600">{formatGTQ(summary.income.total)}</span>
                </div>
              </div>

              {/* Right column - Deductions */}
              <div className="space-y-3 rounded-lg border p-4">
                <h5 className="font-medium text-sm text-muted-foreground">DEDUCCIONES</h5>
                
                <div className="flex justify-between text-sm">
                  <span>Deducción Fija Anual</span>
                  <span>{formatGTQ(summary.deductions.deduccionFija)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA Personal (máx 12% renta)</span>
                  <span>{formatGTQ(summary.deductions.ivaPersonal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Donaciones (máx 5% renta)</span>
                  <span>{formatGTQ(summary.deductions.donaciones)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cuotas IGSS</span>
                  <span>{formatGTQ(summary.deductions.cuotasIgss)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Otras Deducciones</span>
                  <span>{formatGTQ(summary.deductions.otras)}</span>
                </div>
                
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Deducciones</span>
                  <span className="text-blue-600">{formatGTQ(summary.deductions.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Calculation */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
            <h4 className="font-semibold text-lg">Resultado Final</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span>Total Ingresos</span>
                <span className="font-medium">{formatGTQ(summary.income.total)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>(-) Total Deducciones</span>
                <span className="font-medium text-blue-600">{formatGTQ(summary.deductions.total)}</span>
              </div>
            </div>
            
            <div className="flex justify-between py-2 border-b border-primary/20 text-lg">
              <span className="font-semibold">Renta Imponible</span>
              <span className="font-bold">{formatGTQ(summary.calculation.rentaImponible)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2">
                <span>ISR Causado (5%/7%)</span>
                <span className="font-medium">{formatGTQ(summary.calculation.isrBruto)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>(-) ISR Retenido</span>
                <span className="font-medium text-orange-600">{formatGTQ(summary.calculation.isrRetenido)}</span>
              </div>
            </div>

            <div className={`flex justify-between py-4 rounded-lg px-4 text-xl ${
              isrResult.type === "pagar" ? "bg-red-100" : "bg-green-100"
            }`}>
              <span className="font-bold">
                {isrResult.type === "pagar" ? "ISR A PAGAR" : "ISR A FAVOR"}
              </span>
              <span className={`font-bold ${
                isrResult.type === "pagar" ? "text-red-600" : "text-green-600"
              }`}>
                {formatGTQ(isrResult.amount)}
              </span>
            </div>

            {isrResult.type === "pagar" && isrResult.amount > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>
                  Tienes un saldo pendiente de ISR. Debes presentar tu declaración anual y pagar 
                  antes del 31 de marzo del siguiente año fiscal.
                </p>
              </div>
            )}

            {isrResult.type === "favor" && isrResult.amount > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>
                  ¡Excelente! Tienes un crédito fiscal a tu favor. Puedes solicitar la devolución 
                  o acreditarlo contra futuros impuestos.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleRecalculate} disabled={loading}>
              {loading ? <Spinner size="sm" /> : <><Calculator className="mr-2 h-4 w-4" /> Recalcular</>}
            </Button>
            <Button onClick={handleSave} disabled={saving || saved}>
              {saving ? (
                <Spinner size="sm" />
              ) : saved ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Guardado</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Guardar Cálculo</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filing info */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <h4 className="font-semibold">Presentar Declaración Anual</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Una vez que hayas verificado tus datos, puedes presentar tu declaración anual 
                del ISR en el portal de la SAT (Agencia Virtual). Necesitarás tu NIT y contraseña.
              </p>
              <Button variant="link" className="px-0 mt-2" asChild>
                <a href="https://portal.sat.gob.gt/portal/" target="_blank" rel="noopener noreferrer">
                  Ir al Portal SAT →
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
