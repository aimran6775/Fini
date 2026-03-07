"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { updateInvoice } from "@/app/actions/invoices";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_type: string;
  bien_o_servicio: string;
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [felType, setFelType] = useState("FACT");
  const [clientName, setClientName] = useState("Consumidor Final");
  const [clientNit, setClientNit] = useState("CF");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("GTQ");
  const [taxType, setTaxType] = useState("GRAVADA");
  const [notes, setNotes] = useState("");
  const [contactId, setContactId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, discount: 0, tax_type: "GRAVADA", bien_o_servicio: "B" },
  ]);

  useEffect(() => {
    async function loadInvoice() {
      const { id } = await params;
      setInvoiceId(id);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: invoice } = await supabase
        .from("fel_invoices")
        .select(`*, items:fel_invoice_items(*)`)
        .eq("id", id)
        .single();

      if (!invoice || invoice.status !== "DRAFT") {
        router.push(`/dashboard/invoices/${id}`);
        return;
      }

      setFelType(invoice.fel_type);
      setClientName(invoice.client_name);
      setClientNit(invoice.client_nit);
      setClientEmail(invoice.client_email || "");
      setClientAddress(invoice.client_address || "");
      setInvoiceDate(invoice.invoice_date || "");
      setDueDate(invoice.due_date || "");
      setCurrency(invoice.currency);
      setTaxType(invoice.tax_type);
      setNotes(invoice.notes || "");
      setContactId(invoice.contact_id || "");

      if (invoice.items && (invoice.items as any[]).length > 0) {
        setItems(
          (invoice.items as any[]).map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount: Number(item.discount || 0),
            tax_type: item.tax_type || "GRAVADA",
            bien_o_servicio: item.bien_o_servicio || "B",
          }))
        );
      }

      setLoading(false);
    }
    loadInvoice();
  }, [params, router]);

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, discount: 0, tax_type: "GRAVADA", bien_o_servicio: "B" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof InvoiceItem, value: string | number) {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  }

  function getSubtotal() {
    return items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unit_price - (item.discount || 0);
      return sum + lineTotal;
    }, 0);
  }

  function getIvaTotal() {
    return items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unit_price - (item.discount || 0);
      if (item.tax_type === "GRAVADA") {
        return sum + (lineTotal - lineTotal / 1.12);
      }
      return sum;
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("fel_type", felType);
    formData.set("client_name", clientName);
    formData.set("client_nit", clientNit);
    formData.set("client_email", clientEmail);
    formData.set("client_address", clientAddress);
    formData.set("invoice_date", invoiceDate);
    formData.set("due_date", dueDate);
    formData.set("currency", currency);
    formData.set("tax_type", taxType);
    formData.set("notes", notes);
    formData.set("contact_id", contactId);
    formData.set("items", JSON.stringify(items));

    const result = await updateInvoice(invoiceId, formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
    // redirect happens in action
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/invoices/${invoiceId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Factura</h1>
          <p className="text-muted-foreground">Modifica los datos de la factura en borrador</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo de Documento</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={felType}
                onChange={(e) => setFelType(e.target.value)}
              >
                <option value="FACT">Factura</option>
                <option value="FCAM">Factura Cambiaria</option>
                <option value="FPEQ">Pequeño Contribuyente</option>
                <option value="FESP">Factura Especial</option>
                <option value="NDEB">Nota de Débito</option>
                <option value="NABN">Nota de Abono</option>
              </select>
            </div>
            <div>
              <Label>Tipo Impositivo</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
              >
                <option value="GRAVADA">Gravada (IVA 12%)</option>
                <option value="EXENTA">Exenta</option>
                <option value="NO_SUJETA">No Sujeta</option>
              </select>
            </div>
            <div>
              <Label>Fecha de Emisión</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <Label>Fecha de Vencimiento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Moneda</Label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GTQ">GTQ — Quetzal</option>
                <option value="USD">USD — Dólar</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader><CardTitle>Datos del Cliente</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre del Cliente</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div>
              <Label>NIT</Label>
              <Input value={clientNit} onChange={(e) => setClientNit(e.target.value)} required />
            </div>
            <div>
              <Label>Correo</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Productos / Servicios</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> Agregar Línea
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="grid gap-3 sm:grid-cols-7 items-end border-b pb-4">
                <div className="sm:col-span-2">
                  <Label>Descripción</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Precio Unit.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Descuento</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateItem(idx, "discount", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>B/S</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={item.bien_o_servicio}
                    onChange={(e) => updateItem(idx, "bien_o_servicio", e.target.value)}
                  >
                    <option value="B">Bien</option>
                    <option value="S">Servicio</option>
                  </select>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Q{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (12%)</span>
                  <span>Q{getIvaTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>Q{getSubtotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/dashboard/invoices/${invoiceId}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
