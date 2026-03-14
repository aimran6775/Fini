import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getTrialBalance } from "@/app/actions/reports";

const TYPE_LABELS: Record<string, string> = {
  ASSET: "Activo",
  LIABILITY: "Pasivo",
  EQUITY: "Patrimonio",
  REVENUE: "Ingreso",
  COST: "Costo",
  EXPENSE: "Gasto",
};

export default async function BalanceComprobacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, nit_number)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");
  const org = membership.organizations as any;
  const today = new Date().toISOString().split("T")[0];

  const rows = await getTrialBalance(membership.organization_id, today);

  const totalDebit = rows.reduce((s, r) => s + r.total_debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.total_credit, 0);
  const totalDebitBalance = rows.reduce((s, r) => s + r.debit_balance, 0);
  const totalCreditBalance = rows.reduce((s, r) => s + r.credit_balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Balance de Comprobación</h1>
          <p className="text-muted-foreground">{org?.name} • Al {formatDate(today)}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No hay movimientos contables registrados</p>
              <Link href="/dashboard/journal/new">
                <Button variant="outline" className="mt-4">Crear Primera Partida</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Debe (Movimientos)</TableHead>
                  <TableHead className="text-right">Haber (Movimientos)</TableHead>
                  <TableHead className="text-right">Saldo Deudor</TableHead>
                  <TableHead className="text-right">Saldo Acreedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.account_code}>
                    <TableCell className="font-mono text-xs">{r.account_code}</TableCell>
                    <TableCell>{r.account_name}</TableCell>
                    <TableCell className="text-xs">{TYPE_LABELS[r.account_type] || r.account_type}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.total_debit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.total_credit)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {r.debit_balance > 0 ? formatCurrency(r.debit_balance) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {r.credit_balance > 0 ? formatCurrency(r.credit_balance) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals */}
                <TableRow className="font-bold border-t-2">
                  <TableCell colSpan={3}>TOTALES</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebitBalance)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCreditBalance)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className={Math.abs(totalDebit - totalCredit) < 0.01 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-4 text-center text-sm">
            {Math.abs(totalDebit - totalCredit) < 0.01
              ? "El balance cuadra — Suma de Débitos = Suma de Créditos"
              : `Diferencia: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
