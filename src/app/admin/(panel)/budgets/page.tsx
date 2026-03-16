import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "account_id", label: "Cuenta ID", editable: true },
  { key: "period_type", label: "Período", type: "select" as const, options: ["MONTHLY", "QUARTERLY", "ANNUAL"], editable: true },
  { key: "period_year", label: "Año", type: "number" as const, editable: true },
  { key: "period_month", label: "Mes", type: "number" as const, editable: true },
  { key: "period_quarter", label: "Trimestre", type: "number" as const, editable: true },
  { key: "budgeted_amount", label: "Presupuesto", type: "currency" as const, editable: true },
  { key: "actual_amount", label: "Real", type: "currency" as const, editable: true },
  { key: "notes", label: "Notas", editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminBudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("budgets", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "notes",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="budgets"
        title="Presupuestos"
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
