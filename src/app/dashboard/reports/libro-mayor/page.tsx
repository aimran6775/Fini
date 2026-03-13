import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import { getLibroMayor } from "@/app/actions/reports";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function LibroMayorPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; account?: string }>;
}) {
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

  const params = await searchParams;
  const now = new Date();
  const startDate = params.start || `${now.getFullYear()}-01-01`;
  const endDate = params.end || `${now.getFullYear()}-12-31`;

  const ledger = await getLibroMayor(
    membership.organization_id,
    startDate,
    endDate,
    params.account
  );

  // Totals across all accounts
  const totalDebit = ledger.reduce((s, a) => s + a.total_debit, 0);
  const totalCredit = ledger.reduce((s, a) => s + a.total_credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/reports" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Volver a reportes
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" /> Libro Mayor
          </h1>
          <p className="text-muted-foreground">
            Período: {new Date(startDate).toLocaleDateString("es-GT")} — {new Date(endDate).toLocaleDateString("es-GT")}
          </p>
        </div>
      </div>

      {/* Period Filter Form */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha inicio</label>
              <input
                type="date"
                name="start"
                defaultValue={startDate}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha fin</label>
              <input
                type="date"
                name="end"
                defaultValue={endDate}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Filtrar
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Cuentas con movimiento</p>
            <p className="text-2xl font-bold">{ledger.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Total Débitos</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Total Créditos</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCredit)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger by Account */}
      {ledger.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-muted-foreground">No hay movimientos en el período seleccionado</p>
          </CardContent>
        </Card>
      ) : (
        ledger.map((account) => (
          <Card key={account.account_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  <span className="font-mono text-muted-foreground mr-2">{account.account_code}</span>
                  {account.account_name}
                </CardTitle>
                <Badge variant="outline">{account.account_type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Fecha</TableHead>
                    <TableHead className="w-24">Partida</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Debe</TableHead>
                    <TableHead className="text-right">Haber</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  {account.opening_balance !== 0 && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="text-sm italic text-muted-foreground">
                        Saldo anterior
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(account.opening_balance)}
                      </TableCell>
                    </TableRow>
                  )}

                  {account.entries.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">
                        {new Date(entry.entry_date).toLocaleDateString("es-GT")}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.entry_number}</TableCell>
                      <TableCell className="text-sm">{entry.description}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        {formatCurrency(entry.running_balance)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals Row */}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell colSpan={3} className="text-sm">
                      Totales
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(account.total_debit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(account.total_credit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(account.closing_balance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
