import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getEstadoResultados, getQuickFinancials } from "@/app/actions/reports";
import { MONTH_NAMES, TAX_RATES } from "@/lib/tax-utils";

export default async function EstadoResultadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, nit_number, isr_regime)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const orgId = membership.organization_id;
  const org = membership.organizations as any;

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  const [data, quickData] = await Promise.all([
    getEstadoResultados(orgId, yearStart, yearEnd),
    getQuickFinancials(orgId),
  ]);

  // If no journal entries, use invoice/expense data
  const hasJournalData = data.totalIngresos > 0 || data.totalCostos > 0 || data.totalGastos > 0;
  const revenue = hasJournalData ? data.totalIngresos : quickData.year.revenue;
  const costs = hasJournalData ? data.totalCostos : 0;
  const expenses = hasJournalData ? data.totalGastos : quickData.year.expenses;
  const grossProfit = revenue - costs;
  const netProfit = grossProfit - expenses;

  // ISR calculation
  const isrRegime = org?.isr_regime || "UTILIDADES";
  let isrAmount = 0;
  if (isrRegime === "UTILIDADES") {
    isrAmount = Math.max(0, netProfit) * TAX_RATES.ISR_UTILIDADES;
  } else {
    if (revenue <= TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD * 12) {
      isrAmount = revenue * TAX_RATES.ISR_SIMPLIFICADO_LOW;
    } else {
      isrAmount = TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD * 12 * TAX_RATES.ISR_SIMPLIFICADO_LOW
        + (revenue - TAX_RATES.ISR_SIMPLIFICADO_THRESHOLD * 12) * TAX_RATES.ISR_SIMPLIFICADO_HIGH;
    }
  }

  const utilidadDespuesISR = netProfit - isrAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Estado de Resultados</h1>
          <p className="text-muted-foreground">
            {org?.name} • Del {formatDate(yearStart)} al {formatDate(yearEnd)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Resultados — Año {now.getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl">
          {/* Ingresos */}
          <div className="space-y-2">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Ingresos
            </h3>
            {hasJournalData && data.ingresos.length > 0 ? (
              data.ingresos.map((i) => (
                <div key={i.account_id} className="flex justify-between text-sm pl-4">
                  <span>{i.account_code} — {i.account_name}</span>
                  <span>{formatCurrency(i.balance)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm pl-4">
                <span className="text-muted-foreground">Ventas (facturas certificadas)</span>
                <span>{formatCurrency(revenue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Ingresos</span>
              <span className="text-green-700">{formatCurrency(revenue)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Costos */}
          {(hasJournalData && data.costos.length > 0) && (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-700">Costo de Ventas</h3>
                {data.costos.map((c) => (
                  <div key={c.account_id} className="flex justify-between text-sm pl-4">
                    <span>{c.account_code} — {c.account_name}</span>
                    <span>{formatCurrency(c.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Costo de Ventas</span>
                  <span className="text-orange-700">{formatCurrency(costs)}</span>
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}

          {/* Utilidad Bruta */}
          <div className="flex justify-between font-bold text-lg bg-muted/50 p-3 rounded-lg">
            <span>Utilidad Bruta</span>
            <span className={grossProfit >= 0 ? "text-green-700" : "text-red-700"}>
              {formatCurrency(grossProfit)}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Gastos */}
          <div className="space-y-2">
            <h3 className="font-semibold text-red-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Gastos de Operación
            </h3>
            {hasJournalData && data.gastos.length > 0 ? (
              data.gastos.map((g) => (
                <div key={g.account_id} className="flex justify-between text-sm pl-4">
                  <span>{g.account_code} — {g.account_name}</span>
                  <span>{formatCurrency(g.balance)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm pl-4">
                <span className="text-muted-foreground">Gastos aprobados</span>
                <span>{formatCurrency(expenses)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Gastos</span>
              <span className="text-red-700">{formatCurrency(expenses)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Utilidad antes de ISR */}
          <div className="flex justify-between font-bold text-lg bg-muted/50 p-3 rounded-lg">
            <span>Utilidad Antes de ISR</span>
            <span className={netProfit >= 0 ? "text-green-700" : "text-red-700"}>
              {formatCurrency(netProfit)}
            </span>
          </div>

          <Separator className="my-4" />

          {/* ISR */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                ISR — Régimen {isrRegime === "UTILIDADES" ? "Sobre las Utilidades (25%)" : "Simplificado (5%/7%)"}
              </span>
              <span className="text-red-600">{formatCurrency(isrAmount)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Utilidad Neta */}
          <div className="flex justify-between font-bold text-xl bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
            <span>Utilidad Neta del Ejercicio</span>
            <span className={utilidadDespuesISR >= 0 ? "text-green-700" : "text-red-700"}>
              {formatCurrency(utilidadDespuesISR)}
            </span>
          </div>

          {!hasJournalData && (
            <p className="mt-4 text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
              Este reporte se generó con datos de facturas y gastos. Para mayor precisión,
              registre partidas contables en el Libro Diario.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
