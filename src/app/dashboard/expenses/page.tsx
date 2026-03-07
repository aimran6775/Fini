import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseActions } from "@/components/dashboard/expense-actions";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const { data: expenses } = await supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(account_code, account_name)`)
    .eq("organization_id", membership.organization_id)
    .order("expense_date", { ascending: false })
    .limit(100);

  const totalApproved = expenses
    ?.filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) ?? 0;

  const totalPending = expenses?.filter((e: any) => e.status === "DRAFT").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Registra y gestiona los gastos de tu empresa</p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Gasto</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Aprobado</p>
              <p className="text-xl font-bold">{formatCurrency(totalApproved)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <Wallet className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-xl font-bold">{totalPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Registrados</p>
              <p className="text-xl font-bold">{expenses?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado de Gastos</CardTitle></CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Wallet className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay gastos registrados</p>
              <Link href="/dashboard/expenses/new">
                <Button variant="outline" className="mt-4">Registrar Primer Gasto</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Deducible</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp: any) => (
                  <TableRow key={exp.id}>
                    <TableCell>{formatDate(exp.expense_date)}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/expenses/${exp.id}`} className="hover:text-primary hover:underline">
                        {exp.description}
                      </Link>
                    </TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell className="text-xs">{(exp.account as any)?.account_code} {(exp.account as any)?.account_name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell>
                      {exp.is_deductible ? (
                        <Badge variant="success">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={exp.status === "APPROVED" ? "success" : exp.status === "REJECTED" ? "destructive" : "secondary"}>
                        {exp.status === "APPROVED" ? "Aprobado" : exp.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ExpenseActions expenseId={exp.id} status={exp.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
