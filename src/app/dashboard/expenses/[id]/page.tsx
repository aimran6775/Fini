import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Receipt, CheckCircle, FileText } from "lucide-react";
import { formatCurrency, formatDate, formatNIT } from "@/lib/utils";
import { ExpenseActions } from "@/components/dashboard/expense-actions";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expense, error } = await supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(id, account_code, account_name), contact:contacts(id, name, nit_number)`)
    .eq("id", id)
    .single();

  if (error || !expense) notFound();

  const statusLabel = expense.status === "APPROVED" ? "Aprobado" : expense.status === "REJECTED" ? "Rechazado" : "Pendiente";
  const statusColor = expense.status === "APPROVED" ? "success" : expense.status === "REJECTED" ? "destructive" : "secondary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/expenses">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{expense.description}</h1>
              <Badge variant={statusColor as any}>{statusLabel}</Badge>
            </div>
            <p className="text-muted-foreground">{formatDate(expense.expense_date)} • {expense.category || "Sin categoría"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expense.status === "DRAFT" && (
            <Link href={`/dashboard/expenses/${id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
          )}
          <ExpenseActions expenseId={expense.id} status={expense.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Detalle del Gasto</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{expense.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-2xl font-bold">{formatCurrency(expense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IVA Incluido</p>
                  <p>{formatCurrency(expense.iva_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto sin IVA</p>
                  <p>{formatCurrency(Number(expense.amount) - Number(expense.iva_amount))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p>{formatDate(expense.expense_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p>{expense.category || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuenta Contable</p>
                  <p>
                    {(expense.account as any)?.account_code
                      ? `${(expense.account as any).account_code} — ${(expense.account as any).account_name}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moneda</p>
                  <p>{expense.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier / FEL Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Proveedor y Comprobante</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-medium">{expense.supplier_name || (expense.contact as any)?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIT Proveedor</p>
                  <p className="font-mono">{expense.supplier_nit ? formatNIT(expense.supplier_nit) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiene Comprobante</p>
                  <Badge variant={expense.has_receipt ? "success" : "secondary"}>
                    {expense.has_receipt ? "Sí" : "No"}
                  </Badge>
                </div>
                {expense.fel_uuid && (
                  <div>
                    <p className="text-sm text-muted-foreground">UUID FEL</p>
                    <p className="font-mono text-xs break-all">{expense.fel_uuid}</p>
                  </div>
                )}
                {expense.fel_serie && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serie/Número FEL</p>
                    <p className="font-mono">{expense.fel_serie}-{expense.fel_numero}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Información Fiscal</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo Impositivo</p>
                <p>{expense.tax_type === "GRAVADA" ? "Gravada" : expense.tax_type === "EXENTA" ? "Exenta" : "No Sujeta"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deducible</p>
                <Badge variant={expense.is_deductible ? "success" : "secondary"}>
                  {expense.is_deductible ? "Sí — Deducible" : "No Deducible"}
                </Badge>
              </div>
              {expense.deduction_category && (
                <div>
                  <p className="text-sm text-muted-foreground">Categoría de Deducción</p>
                  <p>{expense.deduction_category}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Historial</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Creado: {formatDate(expense.created_at)}</p>
              {expense.updated_at !== expense.created_at && (
                <p className="text-muted-foreground">Actualizado: {formatDate(expense.updated_at)}</p>
              )}
              {expense.approved_by && (
                <p className="text-muted-foreground">Aprobado por: {expense.approved_by}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
