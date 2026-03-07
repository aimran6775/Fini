import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Printer, CheckCircle, XCircle, Copy } from "lucide-react";
import { formatCurrency, formatDate, formatNIT } from "@/lib/utils";
import { FEL_TYPE_LABELS, FEL_STATUS_LABELS } from "@/lib/tax-utils";
import { InvoiceActions } from "@/components/dashboard/invoice-actions";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice, error } = await supabase
    .from("fel_invoices")
    .select(`*, contact:contacts(id, name, nit_number, email, phone, address), items:fel_invoice_items(*)`)
    .eq("id", id)
    .single();

  if (error || !invoice) notFound();

  const status = FEL_STATUS_LABELS[invoice.status] || { label: invoice.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {invoice.fel_serie ? `${invoice.fel_serie}-${invoice.fel_numero}` : "Borrador"}
              </h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              {FEL_TYPE_LABELS[invoice.fel_type] || invoice.fel_type} • {formatDate(invoice.invoice_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "DRAFT" && (
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
          )}
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{invoice.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIT</p>
                  <p className="font-mono">{invoice.client_nit === "CF" ? "CF" : formatNIT(invoice.client_nit)}</p>
                </div>
                {invoice.client_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p>{invoice.client_email}</p>
                  </div>
                )}
                {invoice.client_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p>{invoice.client_address}</p>
                  </div>
                )}
                {(invoice.contact as any)?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p>{(invoice.contact as any).phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalle de Productos / Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                    <TableHead className="text-right">IVA</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoice.items as any[])?.map((item: any, idx: number) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.bien_o_servicio === "S" ? "Servicio" : "Bien"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{Number(item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.discount || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.iva_amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <Separator className="my-4" />
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (12%)</span>
                    <span>{formatCurrency(invoice.iva_amount)}</span>
                  </div>
                  {Number(invoice.retencion_isr) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Retención ISR</span>
                      <span>-{formatCurrency(invoice.retencion_isr)}</span>
                    </div>
                  )}
                  {Number(invoice.retencion_iva) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Retención IVA</span>
                      <span>-{formatCurrency(invoice.retencion_iva)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* FEL Certification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {invoice.status === "CERTIFIED" || invoice.status === "AUTHORIZED" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : invoice.status === "VOIDED" ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
                Certificación FEL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">{status.label}</p>
              </div>
              {invoice.fel_uuid && (
                <div>
                  <p className="text-sm text-muted-foreground">UUID FEL</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all">{invoice.fel_uuid}</p>
                  </div>
                </div>
              )}
              {invoice.fel_serie && (
                <div>
                  <p className="text-sm text-muted-foreground">Serie / Número</p>
                  <p className="font-mono">{invoice.fel_serie}-{invoice.fel_numero}</p>
                </div>
              )}
              {invoice.fel_fecha_certificacion && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Certificación</p>
                  <p>{formatDate(invoice.fel_fecha_certificacion)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Estado de Pago</p>
                <Badge variant={
                  invoice.payment_status === "PAID" ? "success" :
                  invoice.payment_status === "PARTIAL" ? "warning" : "secondary"
                }>
                  {invoice.payment_status === "PAID" ? "Pagado" :
                   invoice.payment_status === "PARTIAL" ? "Parcial" : "Pendiente"}
                </Badge>
              </div>
              {invoice.due_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p>{formatDate(invoice.due_date)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Moneda</p>
                <p>{invoice.currency}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                <p>{FEL_TYPE_LABELS[invoice.fel_type] || invoice.fel_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo Impositivo</p>
                <p>{invoice.tax_type === "GRAVADA" ? "Gravada" : invoice.tax_type === "EXENTA" ? "Exenta" : "No Sujeta"}</p>
              </div>
              {invoice.is_pequeno_contribuyente && (
                <div>
                  <Badge variant="outline">Pequeño Contribuyente</Badge>
                </div>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Creado: {formatDate(invoice.created_at)}</p>
                {invoice.updated_at !== invoice.created_at && (
                  <p>Actualizado: {formatDate(invoice.updated_at)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
