import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Receipt, FileText, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceActions } from "@/components/dashboard/invoice-actions";

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  CERTIFIED: "success",
  VOIDED: "destructive",
  ERROR: "destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  CERTIFIED: "Certificada",
  VOIDED: "Anulada",
  ERROR: "Error",
};

const felTypeLabels: Record<string, string> = {
  FACT: "Factura",
  FCAM: "Factura Cambiaria",
  FPEQ: "Factura Pequeño Contribuyente",
  FCAP: "Factura Cambiaria Pequeño",
  FESP: "Factura Especial",
  NABN: "Nota de Abono",
  NDEB: "Nota de Débito",
  RECI: "Recibo",
  RDON: "Recibo por Donación",
  APTS: "Otros",
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const { data: invoices } = await supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number)`)
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const totalCertified = invoices
    ?.filter((i: any) => i.status === "CERTIFIED")
    .reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0;

  const totalDraft = invoices?.filter((i: any) => i.status === "DRAFT").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturación FEL</h1>
          <p className="text-muted-foreground">Gestiona tus facturas electrónicas certificadas por SAT</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nueva Factura
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Receipt className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Facturado</p>
              <p className="text-xl font-bold">{formatCurrency(totalCertified)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Facturas Certificadas</p>
              <p className="text-xl font-bold">{invoices?.filter((i: any) => i.status === "CERTIFIED").length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Borradores</p>
              <p className="text-xl font-bold">{totalDraft}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No hay facturas registradas</p>
              <Link href="/dashboard/invoices/new">
                <Button variant="outline" className="mt-4">Crear Primera Factura</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serie/Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>UUID FEL</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:text-primary">
                        {inv.fel_serie || '—'}-{inv.fel_numero || '—'}
                      </Link>
                    </TableCell>
                    <TableCell>{felTypeLabels[inv.fel_type] || inv.fel_type}</TableCell>
                    <TableCell>{(inv.contact as any)?.name ?? "CF"}</TableCell>
                    <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[inv.status] as any}>
                        {statusLabels[inv.status] || inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {inv.fel_uuid ?? "—"}
                    </TableCell>
                    <TableCell>
                      <InvoiceActions invoiceId={inv.id} status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
