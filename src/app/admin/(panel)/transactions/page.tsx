import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "bank_account_id", label: "Cuenta ID", editable: true, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "transaction_date", label: "Fecha", type: "date" as const, editable: true },
  { key: "description", label: "Descripción", editable: true },
  { key: "amount", label: "Monto", type: "currency" as const, editable: true },
  { key: "category", label: "Categoría", type: "select" as const, options: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "FEE", "INTEREST", "OTHER"], editable: true },
  { key: "reference", label: "Referencia", editable: true },
  { key: "is_reconciled", label: "Conciliado", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("bank_transactions", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "description",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="bank_transactions"
        title="Transacciones Bancarias"
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
