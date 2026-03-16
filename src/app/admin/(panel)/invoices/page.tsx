import { adminListTable } from "@/app/actions/admin";
import { AdminDataTable } from "@/components/admin/data-table";

const columns = [
  { key: "id", label: "ID", editable: false, width: "80px" },
  { key: "organization_id", label: "Org ID", editable: false, width: "80px" },
  { key: "fel_type", label: "Tipo FEL", type: "select" as const, options: ["FACT", "FCAM", "FPEQ", "FCAP", "FESP", "NABN", "NDEB", "RECI", "RDON"], editable: true },
  { key: "status", label: "Estado", type: "select" as const, options: ["DRAFT", "CERTIFIED", "AUTHORIZED", "REJECTED", "VOIDED"], editable: true },
  { key: "payment_status", label: "Pago", type: "select" as const, options: ["UNPAID", "PARTIAL", "PAID"], editable: true },
  { key: "client_name", label: "Cliente", editable: true },
  { key: "client_nit", label: "NIT Cliente", editable: true },
  { key: "subtotal", label: "Subtotal", type: "currency" as const, editable: true },
  { key: "iva_amount", label: "IVA", type: "currency" as const, editable: true },
  { key: "total", label: "Total", type: "currency" as const, editable: true },
  { key: "invoice_date", label: "Fecha", type: "date" as const, editable: true },
  { key: "fel_uuid", label: "FEL UUID", editable: false },
  { key: "created_at", label: "Creado", type: "date" as const, editable: false },
];

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 25;
  const search = params.search || "";

  const { data, count } = await adminListTable("fel_invoices", {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search,
    searchColumn: "client_name",
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminDataTable
        table="fel_invoices"
        title="Facturas FEL"
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
