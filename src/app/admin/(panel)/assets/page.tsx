import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "asset_name", label: "Nombre", editable: true },
  { key: "asset_category", label: "Categoría", editable: true },
  { key: "acquisition_date", label: "Fecha Adq.", type: "date" as const, editable: true },
  { key: "acquisition_cost", label: "Costo Adq.", type: "currency" as const, editable: true },
  { key: "residual_value", label: "Valor Residual", type: "currency" as const, editable: true },
  { key: "useful_life_years", label: "Vida Útil (años)", type: "number" as const, editable: true },
  { key: "depreciation_rate", label: "Tasa Dep. %", type: "number" as const, editable: true },
  { key: "accumulated_depreciation", label: "Dep. Acumulada", type: "currency" as const, editable: true },
  { key: "net_book_value", label: "Valor Libro", type: "currency" as const, editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["ACTIVE", "FULLY_DEPRECIATED", "DISPOSED"], editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("fixed_assets", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "asset_name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="fixed_assets"
        title="Activos Fijos"
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
