import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, Plus, FileText, Receipt, Calendar, Play, 
  Pause, AlertCircle, CheckCircle2 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { getRecurringTransactions, getDueRecurringTransactions } from "@/app/actions/recurring";
import { AddRecurringForm } from "@/components/dashboard/add-recurring-form";
import { RecurringActions } from "@/components/dashboard/recurring-actions";

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export default async function RecurringPage() {
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
  const orgId = membership.organization_id;

  const [recurring, dueRecurring] = await Promise.all([
    getRecurringTransactions(orgId),
    getDueRecurringTransactions(orgId),
  ]);

  // Get invoices and expenses for the form
  const [{ data: invoices }, { data: expenses }] = await Promise.all([
    supabase
      .from("fel_invoices")
      .select("id, client_name, total_amount, status")
      .eq("organization_id", orgId)
      .in("status", ["DRAFT", "CERTIFIED", "AUTHORIZED"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("expenses")
      .select("id, vendor_name, total_amount, status")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const activeCount = recurring.filter((r: any) => r.is_active).length;
  const totalMonthly = recurring
    .filter((r: any) => r.is_active)
    .reduce((sum: number, r: any) => {
      const amount = r.source_type === "INVOICE" 
        ? Number(r.invoice?.total_amount || 0)
        : Number(r.expense?.total_amount || 0);
      
      // Normalize to monthly
      switch (r.frequency) {
        case "WEEKLY": return sum + (amount * 4.33);
        case "BIWEEKLY": return sum + (amount * 2.17);
        case "MONTHLY": return sum + amount;
        case "QUARTERLY": return sum + (amount / 3);
        case "SEMIANNUAL": return sum + (amount / 6);
        case "ANNUAL": return sum + (amount / 12);
        default: return sum;
      }
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacciones Recurrentes</h1>
          <p className="text-muted-foreground">
            Automatiza facturas y gastos que se repiten periódicamente
          </p>
        </div>
        <AddRecurringForm 
          orgId={orgId}
          invoices={invoices || []}
          expenses={expenses || []}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes de Generar</p>
                <p className="text-2xl font-bold">{dueRecurring.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mensual Estimado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Transactions Alert */}
      {dueRecurring.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Transacciones Pendientes de Generar
            </CardTitle>
            <CardDescription className="text-orange-700">
              Estas transacciones están listas para ser generadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueRecurring.map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <div className="flex items-center gap-3">
                    {rec.source_type === "INVOICE" ? (
                      <FileText className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Receipt className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {rec.source_type === "INVOICE" 
                          ? rec.invoice?.client_name 
                          : rec.expense?.vendor_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(
                          rec.source_type === "INVOICE" 
                            ? rec.invoice?.total_amount 
                            : rec.expense?.total_amount
                        )} — {FREQUENCY_LABELS[rec.frequency]}
                      </p>
                    </div>
                  </div>
                  <RecurringActions 
                    recurring={rec} 
                    orgId={orgId}
                    showGenerate
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Recurring Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Transacciones Recurrentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recurring.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <RefreshCw className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay transacciones recurrentes configuradas</p>
              <p className="text-sm">Crea una para automatizar facturas o gastos repetitivos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Próxima Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurring.map((rec: any) => {
                  const isInvoice = rec.source_type === "INVOICE";
                  const name = isInvoice ? rec.invoice?.client_name : rec.expense?.vendor_name;
                  const amount = isInvoice ? rec.invoice?.total_amount : rec.expense?.total_amount;
                  const isPastDue = new Date(rec.next_date) <= new Date();
                  
                  return (
                    <TableRow key={rec.id}>
                      <TableCell>
                        {isInvoice ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            <FileText className="mr-1 h-3 w-3" />
                            Factura
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <Receipt className="mr-1 h-3 w-3" />
                            Gasto
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{name || "—"}</TableCell>
                      <TableCell>{formatCurrency(amount || 0)}</TableCell>
                      <TableCell>{FREQUENCY_LABELS[rec.frequency]}</TableCell>
                      <TableCell>
                        <span className={isPastDue && rec.is_active ? "text-orange-600 font-medium" : ""}>
                          {new Date(rec.next_date).toLocaleDateString("es-GT")}
                        </span>
                        {isPastDue && rec.is_active && (
                          <Badge variant="warning" className="ml-2">Vencida</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {rec.is_active ? (
                          <Badge variant="success">
                            <Play className="mr-1 h-3 w-3" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Pause className="mr-1 h-3 w-3" />
                            Pausada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <RecurringActions 
                          recurring={rec} 
                          orgId={orgId}
                        />
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
