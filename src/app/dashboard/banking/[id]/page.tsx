import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Landmark, ArrowLeft, Plus, ArrowDownLeft, ArrowUpRight, 
  CheckCircle2, Circle, RefreshCw, History 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { getBankAccount, getBankTransactions, getReconciliations } from "@/app/actions/banking";
import { AddTransactionForm } from "@/components/dashboard/add-transaction-form";
import { ReconciliationForm } from "@/components/dashboard/reconciliation-form";
import { BankExportButton } from "@/components/dashboard/bank-export";

const CATEGORY_LABELS: Record<string, string> = {
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Retiro",
  TRANSFER: "Transferencia",
  FEE: "Comisión",
  INTEREST: "Interés",
  OTHER: "Otro",
};

export default async function BankAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "transactions" } = await searchParams;
  
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

  let account;
  try {
    account = await getBankAccount(id);
  } catch {
    notFound();
  }

  if (!account || account.organization_id !== membership.organization_id) {
    notFound();
  }

  const [transactions, reconciliations] = await Promise.all([
    getBankTransactions(id),
    getReconciliations(id),
  ]);

  // Calculate unreconicled total
  const unreconciledTxns = transactions.filter((t: any) => !t.is_reconciled);
  const unreconciledTotal = unreconciledTxns.reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/banking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              {account.bank_name}
            </h1>
            <p className="text-muted-foreground">
              {account.account_name} • {account.account_number} • {account.account_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BankExportButton
            accountId={id}
            bankName={account.bank_name}
            accountName={account.account_name}
            transactions={transactions}
          />
          <Badge variant={account.is_active ? "success" : "secondary"}>
            {account.is_active ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Saldo en Libros</p>
            <p className="text-3xl font-bold">{formatCurrency(account.current_balance, account.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Movimientos Sin Conciliar</p>
            <p className="text-2xl font-bold">{unreconciledTxns.length}</p>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(unreconciledTotal, account.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Última Conciliación</p>
            {reconciliations.length > 0 ? (
              <>
                <p className="text-lg font-bold">
                  {new Date(reconciliations[0].period_end).toLocaleDateString("es-GT")}
                </p>
                <Badge variant={reconciliations[0].status === "COMPLETED" ? "success" : "warning"}>
                  {reconciliations[0].status === "COMPLETED" ? "Completada" : "En Progreso"}
                </Badge>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">Sin conciliaciones</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            <History className="mr-2 h-4 w-4" />
            Movimientos
          </TabsTrigger>
          <TabsTrigger value="reconcile">
            <RefreshCw className="mr-2 h-4 w-4" />
            Conciliar
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Movimientos Bancarios</h3>
            <AddTransactionForm 
              accountId={id} 
              orgId={membership.organization_id} 
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No hay movimientos registrados</p>
                  <p className="text-sm">Agrega movimientos bancarios para comenzar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Conciliado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn: any) => {
                      const isDebit = txn.amount < 0;
                      return (
                        <TableRow key={txn.id}>
                          <TableCell>
                            {isDebit ? (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-green-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(txn.transaction_date).toLocaleDateString("es-GT")}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {txn.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {CATEGORY_LABELS[txn.category] || txn.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {txn.reference || "—"}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${isDebit ? "text-red-600" : "text-green-600"}`}>
                            {isDebit ? "-" : "+"}{formatCurrency(Math.abs(txn.amount), account.currency)}
                          </TableCell>
                          <TableCell>
                            {txn.is_reconciled ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconcile" className="space-y-4">
          <ReconciliationForm 
            account={account}
            orgId={membership.organization_id}
            transactions={unreconciledTxns}
            previousReconciliations={reconciliations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
