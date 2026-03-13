import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExpensesTable } from "@/components/dashboard/expenses-table";
import { ListFilters } from "@/components/dashboard/list-filters";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; is_deductible?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
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

  // Build query with filters
  let query = supabase
    .from("expenses")
    .select(`*, account:chart_of_accounts(account_code, account_name)`)
    .eq("organization_id", membership.organization_id)
    .order("expense_date", { ascending: false })
    .limit(100);

  if (params.search) {
    query = query.or(`description.ilike.%${params.search}%,supplier_name.ilike.%${params.search}%,category.ilike.%${params.search}%`);
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

  const { data: expenses } = await query;

  const totalApproved = (expenses || [])
    .filter((e: any) => e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const totalPending = (expenses || []).filter((e: any) => e.status === "DRAFT").length;
  const totalDeductible = (expenses || [])
    .filter((e: any) => e.is_deductible && e.status === "APPROVED")
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deducibles</p>
              <p className="text-xl font-bold">{formatCurrency(totalDeductible)}</p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-xl font-bold">{expenses?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado de Gastos ({expenses?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <ExpensesTable expenses={expenses || []} organizationId={membership.organization_id} />
        </CardContent>
      </Card>
    </div>
  );
}
