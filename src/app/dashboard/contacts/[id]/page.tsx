import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Building2, Edit, Mail, MapPin, Phone, FileText, 
  Receipt, Calendar, User, CreditCard
} from "lucide-react";
import { formatCurrency, formatDate, formatNIT, formatDPI } from "@/lib/utils";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get organization membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard");

  // Get contact
  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single();

  if (error || !contact) notFound();

  // Get invoices for this contact (by NIT match)
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, fel_serie, fel_numero, invoice_date, total, status, fel_type")
    .eq("organization_id", membership.organization_id)
    .eq("client_nit", contact.nit_number)
    .order("invoice_date", { ascending: false })
    .limit(10);

  // Get expenses for this vendor
  const { data: expenses } = contact.contact_type !== "CLIENT" 
    ? await supabase
        .from("expenses")
        .select("id, expense_date, vendor_name, total, status, category")
        .eq("organization_id", membership.organization_id)
        .eq("vendor_nit", contact.nit_number)
        .order("expense_date", { ascending: false })
        .limit(10)
    : { data: [] };

  // Calculate totals
  const invoiceTotal = (invoices || []).reduce((sum, inv) => sum + Number(inv.total), 0);
  const expenseTotal = (expenses || []).reduce((sum, exp) => sum + Number(exp.total), 0);

  const contactTypeLabel = contact.contact_type === "CLIENT" 
    ? "Cliente" 
    : contact.contact_type === "VENDOR" 
      ? "Proveedor" 
      : "Cliente y Proveedor";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contacts">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{contact.name}</h1>
              <Badge variant={contact.is_active ? "success" : "secondary"}>
                {contact.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {contactTypeLabel} • {contact.nit_number === "CF" ? "Consumidor Final" : `NIT: ${formatNIT(contact.nit_number)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/contacts/${id}/edit`}>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Facturas</p>
              <p className="text-2xl font-bold">{invoices?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Facturado</p>
              <p className="text-2xl font-bold">{formatCurrency(invoiceTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Receipt className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compras</p>
              <p className="text-2xl font-bold">{expenses?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Comprado</p>
              <p className="text-2xl font-bold">{formatCurrency(expenseTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Información del Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {contact.nit_number && contact.nit_number !== "CF" && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">NIT</p>
                    <p className="font-mono">{formatNIT(contact.nit_number)}</p>
                  </div>
                </div>
              )}
              {contact.dpi_number && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">DPI</p>
                    <p className="font-mono">{formatDPI(contact.dpi_number)}</p>
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {(contact.address || contact.municipality || contact.department) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p>
                      {[contact.address, contact.municipality, contact.department]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {contact.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{contact.notes}</p>
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Creado: {formatDate(contact.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoices */}
          {(contact.contact_type === "CLIENT" || contact.contact_type === "BOTH") && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Facturas Recientes</CardTitle>
                  <Link href={`/dashboard/invoices?search=${encodeURIComponent(contact.nit_number)}`}>
                    <Button variant="ghost" size="sm">Ver todas</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!invoices || invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No hay facturas para este contacto
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <Link 
                              href={`/dashboard/invoices/${inv.id}`}
                              className="text-primary hover:underline font-mono"
                            >
                              {inv.fel_serie}-{inv.fel_numero}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              inv.status === "AUTHORIZED" ? "success" :
                              inv.status === "PAID" ? "default" :
                              inv.status === "VOIDED" ? "destructive" : "secondary"
                            }>
                              {inv.status === "AUTHORIZED" ? "Autorizada" :
                               inv.status === "PAID" ? "Pagada" :
                               inv.status === "VOIDED" ? "Anulada" :
                               inv.status === "DRAFT" ? "Borrador" : inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(Number(inv.total))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Expenses */}
          {(contact.contact_type === "VENDOR" || contact.contact_type === "BOTH") && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Compras Recientes</CardTitle>
                  <Link href={`/dashboard/expenses?search=${encodeURIComponent(contact.name)}`}>
                    <Button variant="ghost" size="sm">Ver todas</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!expenses || expenses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No hay compras de este proveedor
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>{formatDate(exp.expense_date)}</TableCell>
                          <TableCell className="capitalize">{exp.category?.toLowerCase() || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              exp.status === "APPROVED" ? "success" :
                              exp.status === "PENDING" ? "secondary" : "default"
                            }>
                              {exp.status === "APPROVED" ? "Aprobado" :
                               exp.status === "PENDING" ? "Pendiente" : exp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(Number(exp.total))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
