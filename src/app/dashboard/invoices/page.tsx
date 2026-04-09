import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Receipt, FileText, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ListFilters } from "@/components/dashboard/list-filters";
import { InvoicesTable } from "@/components/dashboard/invoices-table";
import { getInvoices } from "@/app/actions/invoices";
import { InvoiceExportButton } from "@/components/dashboard/invoice-export";
import { Pagination } from "@/components/dashboard/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturación FEL — FiniTax GT",
  description: "Gestión de facturas electrónicas FEL certificadas por SAT",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  CERTIFIED: "Certificada",
  VOIDED: "Anulada",
  ERROR: "Error",
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; payment_status?: string; type?: string; dateFrom?: string; dateTo?: string; page?: string }>;
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

  // Use the server action with filters
  const invoices = await getInvoices(membership.organization_id, {
    search: params.search,
    status: params.status,
    type: params.type,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  // Filter by payment_status client-side (or add to getInvoices)
  let filteredInvoices = invoices || [];
  if (params.payment_status) {
    filteredInvoices = filteredInvoices.filter((inv: any) => inv.payment_status === params.payment_status);
  }

  const totalCertified = filteredInvoices
    .filter((i: any) => i.status === "CERTIFIED")
    .reduce((sum: number, i: any) => sum + Number(i.total || 0), 0);

  const totalDraft = filteredInvoices.filter((i: any) => i.status === "DRAFT").length;
  const totalPendingPayment = filteredInvoices.filter((i: any) => i.payment_status !== "PAID" && i.status === "CERTIFIED").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1>Facturación FEL</h1>
          <p>Gestiona tus facturas electrónicas certificadas por SAT</p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceExportButton
            orgId={membership.organization_id}
            orgName={orgName}
            invoices={filteredInvoices}
            filters={{ dateFrom: params.dateFrom, dateTo: params.dateTo, status: params.status }}
          />
          <Link href="/dashboard/imports/ai-workspace">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Importar con IA
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Factura
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Suspense fallback={null}>
        <ListFilters
          searchPlaceholder="Buscar por cliente, NIT o serie..."
          showDateRange
          filters={[
            {
              key: "status",
              label: "Estado",
              options: [
                { value: "DRAFT", label: "Borrador" },
                { value: "CERTIFIED", label: "Certificada" },
                { value: "VOIDED", label: "Anulada" },
              ],
            },
            {
              key: "payment_status",
              label: "Pago",
              options: [
                { value: "UNPAID", label: "Sin Pagar" },
                { value: "PARTIAL", label: "Parcial" },
                { value: "PAID", label: "Pagada" },
              ],
            },
            {
              key: "type",
              label: "Tipo",
              options: [
                { value: "FACT", label: "Factura" },
                { value: "FPEQ", label: "Pequeño Contrib." },
                { value: "FCAM", label: "Cambiaria" },
                { value: "FESP", label: "Especial" },
              ],
            },
          ]}
        />
      </Suspense>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-emerald">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Facturado</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(totalCertified)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-blue">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Certificadas</p>
              <p className="text-xl font-bold tabular-nums">{filteredInvoices.filter((i: any) => i.status === "CERTIFIED").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-amber">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Borradores</p>
              <p className="text-xl font-bold tabular-nums">{totalDraft}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg kpi-rose">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Por Cobrar</p>
              <p className="text-xl font-bold tabular-nums">{totalPendingPayment}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Facturas ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={filteredInvoices} organizationId={membership.organization_id} />
          <Pagination totalItems={filteredInvoices.length} pageSize={25} />
        </CardContent>
      </Card>
    </div>
  );
}
