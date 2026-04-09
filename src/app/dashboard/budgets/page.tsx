import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presupuestos — FiniTax GT",
  description: "Planificación y control presupuestario",
};

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, account:chart_of_accounts(account_code, account_name)")
    .eq("organization_id", membership.organization_id)
    .order("period_year", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Presupuestos</h1>
          <p>Planificación y control presupuestario</p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Presupuesto</Button>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Presupuestos Activos</CardTitle></CardHeader>
        <CardContent>
          {!budgets || budgets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Wallet className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay presupuestos configurados</p>
              <p className="text-sm mt-1">Crea un presupuesto para controlar tus gastos e ingresos por categoría</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Monto Presupuestado</TableHead>
                  <TableHead className="text-right">Ejecutado</TableHead>
                  <TableHead className="text-right">% Ejecución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b: any) => {
                  const pct = b.budgeted_amount > 0 ? (Number(b.actual_amount || 0) / Number(b.budgeted_amount) * 100) : 0;
                  const periodLabel = b.period_month
                    ? `${b.period_year}-${String(b.period_month).padStart(2, "0")}`
                    : b.period_quarter
                    ? `${b.period_year}-Q${b.period_quarter}`
                    : `${b.period_year}`;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {(b.account as any)?.account_code} {(b.account as any)?.account_name}
                      </TableCell>
                      <TableCell className="text-sm">{b.period_type} — {periodLabel}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.budgeted_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.actual_amount || 0)}</TableCell>
                      <TableCell className="text-right">
                        <span className={pct > 100 ? "text-red-600 font-bold" : pct > 80 ? "text-yellow-600" : "text-green-600"}>
                          {pct.toFixed(1)}%
                        </span>
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
