import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TAX_RATES } from "@/lib/tax-utils";
import { TaxCalculator } from "@/components/dashboard/tax-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impuestos — FiniTax GT",
  description: "Gestión fiscal: IVA, ISR, ISO y más",
};

export default async function TaxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organization:organizations(isr_regime, contribuyente_type)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const org = (membership as any).organization;

  const { data: filings } = await supabase
    .from("tax_filings")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("period_year", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Impuestos</h1>
        <p className="text-sm text-muted-foreground">
          Régimen: {org?.isr_regime === "UTILIDADES" ? "Sobre Utilidades (25%)" : "Simplificado (5%/7%)"} •
          Contribuyente: {org?.contribuyente_type === "PEQUENO" ? "Pequeño" : "General"}
        </p>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">IVA</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{(TAX_RATES.IVA * 100).toFixed(0)}%</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Mensual — Vence día 15</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">ISR</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {org?.isr_regime === "UTILIDADES" ? "25%" : "5%/7%"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {org?.isr_regime === "UTILIDADES" ? "Trimestral" : "Mensual"} — Sobre renta
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">ISO</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{(TAX_RATES.ISO * 100).toFixed(0)}%</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Trimestral — Sobre activos/ingresos</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Timbre Fiscal</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{(TAX_RATES.STAMP_TAX * 100).toFixed(0)}%</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Sobre documentos no afectos a IVA</p>
          </CardContent>
        </Card>
      </div>

      {/* Retention rates info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tasas de Retención ISR</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl kpi-blue p-4">
              <p className="text-[12px] font-medium uppercase tracking-wide">Servicios Profesionales</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">5%</p>
            </div>
            <div className="rounded-xl kpi-emerald p-4">
              <p className="text-[12px] font-medium uppercase tracking-wide">Compra de Bienes</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">6.5%</p>
            </div>
            <div className="rounded-xl kpi-orange p-4">
              <p className="text-[12px] font-medium uppercase tracking-wide">No Domiciliados</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">15%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculator */}
      <TaxCalculator orgId={membership.organization_id} isrRegime={org?.isr_regime || "UTILIDADES"} />

      {/* Filings */}
      <Card>
        <CardHeader><CardTitle>Declaraciones</CardTitle></CardHeader>
        <CardContent>
          {!filings || filings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calculator className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay declaraciones registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Impuesto</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead className="text-right">Neto a Pagar</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filings.map((f: any) => {
                  // Determine display values based on form_type
                  const periodLabel = f.period_month
                    ? `${f.period_year}-${String(f.period_month).padStart(2, "0")}`
                    : f.period_quarter
                    ? `${f.period_year}-Q${f.period_quarter}`
                    : `${f.period_year}`;

                  let taxAmount = 0;
                  let creditAmount = 0;
                  let netAmount = 0;

                  if (f.form_type === "IVA_MENSUAL") {
                    taxAmount = Number(f.iva_debito || 0);
                    creditAmount = Number(f.iva_credito || 0);
                    netAmount = Number(f.iva_a_pagar || 0);
                  } else if (f.form_type?.startsWith("ISR")) {
                    taxAmount = Number(f.isr_amount || 0);
                    creditAmount = Number(f.isr_prepaid || 0);
                    netAmount = Number(f.isr_balance || 0);
                  } else if (f.form_type === "ISO_TRIMESTRAL") {
                    taxAmount = Number(f.iso_amount || 0);
                    creditAmount = Number(f.iso_credited_to_isr || 0);
                    netAmount = Number(f.iso_amount || 0);
                  }

                  const typeLabels: Record<string, string> = {
                    IVA_MENSUAL: "IVA Mensual",
                    ISR_TRIMESTRAL: "ISR Trimestral",
                    ISR_MENSUAL: "ISR Mensual",
                    ISR_ANUAL: "ISR Anual",
                    ISO_TRIMESTRAL: "ISO Trimestral",
                    RETENCIONES_ISR: "Retenciones ISR",
                  };

                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{typeLabels[f.form_type] || f.form_type}</TableCell>
                      <TableCell>{periodLabel}</TableCell>
                      <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(creditAmount)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(netAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === "FILED" ? "success" : f.status === "ACCEPTED" ? "default" : "warning"}>
                          {f.status === "FILED" ? "Presentada" : f.status === "ACCEPTED" ? "Aceptada" : f.status === "CALCULATED" ? "Calculada" : "Borrador"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
