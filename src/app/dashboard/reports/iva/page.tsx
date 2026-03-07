import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MONTH_NAMES, TAX_RATES } from "@/lib/tax-utils";

export default async function IvaReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, nit_number)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgId = membership.organization_id;
  const org = membership.organizations as any;
  const now = new Date();

  // Generate monthly IVA data for the current year
  const months = [];
  for (let m = 0; m < 12; m++) {
    const start = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}-01`;
    const endDate = new Date(now.getFullYear(), m + 1, 0);
    const end = endDate.toISOString().split("T")[0];

    const [{ data: invoices }, { data: expenses }] = await Promise.all([
      supabase.from("fel_invoices")
        .select("total, iva_amount")
        .eq("organization_id", orgId)
        .eq("status", "CERTIFIED")
        .gte("invoice_date", start)
        .lte("invoice_date", end),
      supabase.from("expenses")
        .select("amount, iva_amount")
        .eq("organization_id", orgId)
        .eq("status", "APPROVED")
        .eq("tax_type", "GRAVADA")
        .gte("expense_date", start)
        .lte("expense_date", end),
    ]);

    const debito = invoices?.reduce((s: number, i: any) => s + Number(i.iva_amount), 0) ?? 0;
    const credito = expenses?.reduce((s: number, e: any) => s + Number(e.iva_amount), 0) ?? 0;
    const aPagar = Math.max(0, debito - credito);
    const saldoFavor = Math.max(0, credito - debito);

    months.push({
      month: m,
      name: MONTH_NAMES[m],
      debito: Math.round(debito * 100) / 100,
      credito: Math.round(credito * 100) / 100,
      aPagar: Math.round(aPagar * 100) / 100,
      saldoFavor: Math.round(saldoFavor * 100) / 100,
      isFuture: m > now.getMonth(),
    });
  }

  const totalDebito = months.reduce((s, m) => s + m.debito, 0);
  const totalCredito = months.reduce((s, m) => s + m.credito, 0);
  const totalAPagar = months.reduce((s, m) => s + m.aPagar, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Reporte de IVA</h1>
          <p className="text-muted-foreground">{org?.name} • Año {now.getFullYear()}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">IVA Débito Fiscal (Ventas)</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDebito)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">IVA Crédito Fiscal (Compras)</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCredito)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">IVA a Pagar (Acumulado)</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalAPagar)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Detalle Mensual IVA — {now.getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Débito Fiscal (12%)</TableHead>
                <TableHead className="text-right">Crédito Fiscal (12%)</TableHead>
                <TableHead className="text-right">IVA a Pagar</TableHead>
                <TableHead className="text-right">Saldo a Favor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m) => (
                <TableRow key={m.month} className={m.isFuture ? "opacity-40" : ""}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.debito)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.credito)}</TableCell>
                  <TableCell className="text-right font-medium text-orange-600">
                    {m.aPagar > 0 ? formatCurrency(m.aPagar) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {m.saldoFavor > 0 ? formatCurrency(m.saldoFavor) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2">
                <TableCell>TOTAL ANUAL</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDebito)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCredito)}</TableCell>
                <TableCell className="text-right text-orange-600">{formatCurrency(totalAPagar)}</TableCell>
                <TableCell className="text-right text-green-600">
                  {totalCredito > totalDebito ? formatCurrency(totalCredito - totalDebito) : "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-sm text-blue-800">
          <p className="font-semibold">📋 Declaración SAT-2237</p>
          <p className="mt-1">
            El IVA se declara mensualmente ante la SAT usando el formulario SAT-2237.
            El plazo es hasta el último día hábil del mes siguiente.
            El IVA débito proviene de las facturas emitidas y el IVA crédito de las facturas de compras recibidas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
