import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "account_code", label: "Código", editable: true },
  { key: "account_name", label: "Nombre", editable: true },
  { key: "account_type", label: "Tipo", type: "select" as const, options: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "COST", "EXPENSE"], editable: true },
  { key: "parent_account_id", label: "Cuenta Padre", editable: true },
  { key: "is_active", label: "Activa", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 50;
  const search = params.search || "";

  const { data, count } = await adminListTable("chart_of_accounts", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: "account_code",
    ascending: true,
    search,
    searchColumn: "account_name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="chart_of_accounts"
        title="Plan de Cuentas"
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
