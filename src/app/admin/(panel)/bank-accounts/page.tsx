import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "account_name", label: "Nombre Cuenta", editable: true },
  { key: "bank_name", label: "Banco", editable: true },
  { key: "account_number", label: "Número", editable: true },
  { key: "account_type", label: "Tipo", type: "select" as const, options: ["CHECKING", "SAVINGS", "CREDIT_CARD", "OTHER"], editable: true },
  { key: "currency", label: "Moneda", editable: true },
  { key: "current_balance", label: "Saldo", type: "currency" as const, editable: true },
  { key: "is_active", label: "Activa", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminBankAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("bank_accounts", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "account_name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="bank_accounts"
        title="Cuentas Bancarias"
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
