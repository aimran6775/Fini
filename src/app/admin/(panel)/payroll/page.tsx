import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "period_label", label: "Período", editable: true },
  { key: "period_start", label: "Inicio", type: "date" as const, editable: true },
  { key: "period_end", label: "Fin", type: "date" as const, editable: true },
  { key: "total_gross", label: "Bruto Total", type: "currency" as const, editable: true },
  { key: "total_igss_employee", label: "IGSS Empleado", type: "currency" as const, editable: true },
  { key: "total_igss_employer", label: "IGSS Patrono", type: "currency" as const, editable: true },
  { key: "total_isr", label: "ISR", type: "currency" as const, editable: true },
  { key: "total_net", label: "Neto Total", type: "currency" as const, editable: true },
  { key: "total_employer_cost", label: "Costo Patrono", type: "currency" as const, editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["DRAFT", "APPROVED", "PAID"], editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("payroll_runs", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "period_label",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="payroll_runs"
        title="Planillas de Pago"
        data={data}
        columns={columns}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        searchQuery={search}
      />
    </div>
  );
}
