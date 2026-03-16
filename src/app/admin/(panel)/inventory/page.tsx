import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "sku", label: "SKU", editable: true },
  { key: "name", label: "Nombre", editable: true },
  { key: "category", label: "Categoría", editable: true },
  { key: "unit_price", label: "Precio", type: "currency" as const, editable: true },
  { key: "cost_price", label: "Costo", type: "currency" as const, editable: true },
  { key: "current_stock", label: "Stock", type: "number" as const, editable: true },
  { key: "min_stock", label: "Stock Mín.", type: "number" as const, editable: true },
  { key: "unit_of_measure", label: "Unidad", editable: true },
  { key: "is_active", label: "Activo", type: "boolean" as const, editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("inventory_items", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="inventory_items"
        title="Inventario"
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
