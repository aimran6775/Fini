import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "name", label: "Nombre", editable: true },
  { key: "nit_number", label: "NIT", editable: true },
  { key: "contribuyente_type", label: "Tipo", type: "select" as const, options: ["GENERAL", "PEQUENO"], editable: true },
  { key: "isr_regime", label: "Régimen ISR", type: "select" as const, options: ["UTILIDADES", "SIMPLIFICADO"], editable: true },
  { key: "department", label: "Departamento", editable: true },
  { key: "municipality", label: "Municipio", editable: true },
  { key: "phone", label: "Teléfono", editable: true },
  { key: "email", label: "Email", editable: true },
  { key: "address", label: "Dirección", editable: true },
  { key: "fel_certificador", label: "FEL Cert.", editable: true },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("organizations", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="organizations"
        title="Organizaciones"
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
