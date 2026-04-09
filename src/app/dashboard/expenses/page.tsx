import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExpensesTable } from "@/components/dashboard/expenses-table";
import { ListFilters } from "@/components/dashboard/list-filters";
import { ExpenseExportButton } from "@/components/dashboard/expense-export";
import { Pagination } from "@/components/dashboard/pagination";
import { sanitizeSearch } from "@/lib/validate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastos — FiniTax GT",
  description: "Registro y gestión de gastos empresariales",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; is_deductible?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organization:organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  const orgName = (membership.organization as any)?.name || "Mi Empresa";

  const page = Number(params.page) || 1;
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query with filters
  let query = supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(account_code, account_name)`, { count: "exact" })
    .eq("organization_id", membership.organization_id)
    .order("expense_date", { ascending: false })
    .range(from, to);

  if (params.search) {
    const s = sanitizeSearch(params.search);
    if (s) query = query.or(`description.ilike.%${s}%,supplier_name.ilike.%${s}%,category.ilike.%${s}%`);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.is_deductible === "true") {
    query = query.eq("is_deductible", true);
  } else if (params.is_deductible === "false") {
    query = query.eq("is_deductible", false);
  }
  if (params.dateFrom) {
    query = query.gte("expense_date", params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte("expense_date", params.dateTo);
  }

  const { data: expenses, count: expensesCount } = await query;

  const totalApproved = (expenses || [])
    .filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const totalPending = (expenses || []).filter((e: any) => e.status === "DRAFT").length;
  const totalDeductible = (expenses || [])
    .filter((e: any) => e.is_deductible && e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Gastos</h1>
          <p>Registra y gestiona los gastos de tu empresa</p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseExportButton
            orgId={membership.organization_id}
            orgName={orgName}
            expenses={expenses || []}
            filters={{ dateFrom: params.dateFrom, dateTo: params.dateTo, status: params.status }}
          />
          <Link href="/dashboard/imports/ai-workspace">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Importar con IA
            </Button>
          </Link>
          <Link href="/dashboard/expenses/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Gasto</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Suspense fallback={null}>
        <ListFilters
          searchPlaceholder="Buscar por descripción, proveedor..."
          showDateRange
          filters={[
            {
              key: "status",
              label: "Estado",
              options: [
                { value: "DRAFT", label: "Pendiente" },
                { value: "APPROVED", label: "Aprobado" },
                { value: "REJECTED", label: "Rechazado" },
              ],
            },
            {
              key: "is_deductible",
              label: "Deducible",
              options: [
                { value: "true", label: "Sí" },
                { value: "false", label: "No" },
              ],
            },
          ]}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-rose">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Aprobado</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalApproved)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-emerald">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Deducibles</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalDeductible)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-amber">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Pendientes</p>
              <p className="text-xl font-bold tabular-nums">{totalPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-blue">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Registros</p>
              <p className="text-xl font-bold tabular-nums">{expenses?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado de Gastos ({expensesCount ?? expenses?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <ExpensesTable expenses={expenses || []} organizationId={membership.organization_id} />
          <Pagination totalItems={expensesCount ?? 0} pageSize={pageSize} />
        </CardContent>
      </Card>
    </div>
  );
}
