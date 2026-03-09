"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertBanner } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, ArrowLeft, Upload, X, FileText } from "lucide-react";
import { useOrg } from "@/components/dashboard/shell";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  is_exempt: boolean;
  bien_o_servicio: string;
}

const felTypes = [
  { value: "FACT", label: "FACT — Factura" },
  { value: "FCAM", label: "FCAM — Factura Cambiaria" },
  { value: "FPEQ", label: "FPEQ — Pequeño Contribuyente" },
  { value: "FCAP", label: "FCAP — Cambiaria Pequeño" },
  { value: "FESP", label: "FESP — Factura Especial" },
  { value: "NABN", label: "NABN — Nota de Abono" },
  { value: "NDEB", label: "NDEB — Nota de Débito" },
  { value: "RECI", label: "RECI — Recibo" },
  { value: "RDON", label: "RDON — Recibo por Donación" },
];

export default function NewInvoicePage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [felType, setFelType] = useState("FACT");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, discount: 0, is_exempt: false, bien_o_servicio: "B" },
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, discount: 0, is_exempt: false, bien_o_servicio: "B" }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const totalDiscount = items.reduce((sum, i) => sum + (i.discount || 0), 0);
  const totalAmount = subtotal - totalDiscount;
  const totalIva = items
    .filter((i) => !i.is_exempt)
    .reduce((sum, i) => {
      const net = i.quantity * i.unit_price - (i.discount || 0);
      return sum + (net - net / 1.12);
    }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set("organization_id", currentOrg.id);
    form.set("fel_type", felType);
    // Map invoice_date from issue_date
    const issueDate = form.get("issue_date") as string;
    form.set("invoice_date", issueDate || new Date().toISOString().split("T")[0]);
    // Map client fields
    form.set("client_name", (form.get("client_name") as string) || "Consumidor Final");
    form.set("client_nit", (form.get("client_nit") as string) || "CF");
    // Map items: convert is_exempt to tax_type, include bien_o_servicio
    const mappedItems = items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      tax_type: item.is_exempt ? "EXENTA" : "GRAVADA",
      bien_o_servicio: item.bien_o_servicio || "B",
    }));
    form.set("items", JSON.stringify(mappedItems));

    const result = await createInvoice(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Factura FEL</h1>
          <p className="text-muted-foreground">Crear documento electrónico para certificación SAT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <AlertBanner variant="destructive" message={error} />}

        {/* Header Info */}
        <Card className="mb-6">
          <CardHeader><CardTitle>Datos de la Factura</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo FEL</Label>
              <Select value={felType} onValueChange={setFelType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {felTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Serie</Label>
              <Input id="series" name="series" placeholder="A" defaultValue="A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" name="number" placeholder="0001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Fecha de Emisión</Label>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
              <Input type="hidden" name="due_date" value="" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select name="currency" defaultValue="GTQ">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTQ">GTQ — Quetzal</SelectItem>
                  <SelectItem value="USD">USD — Dólar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Nombre Cliente</Label>
              <Input id="client_name" name="client_name" placeholder="Consumidor Final" defaultValue="Consumidor Final" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_nit">NIT Cliente</Label>
              <Input id="client_nit" name="client_nit" placeholder="CF" defaultValue="CF" />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalle de Productos/Servicios</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" /> Agregar Línea
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <Label className="text-xs">Descripción</Label>
                  <Input
                    placeholder="Producto o servicio"
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Precio Unit.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 space-y-1">
                  <Label className="text-xs">Descuento</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateItem(idx, "discount", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-2 flex flex-col items-center space-y-1">
                  <Label className="text-xs">Exento</Label>
                  <Switch
                    checked={item.is_exempt}
                    onCheckedChange={(v) => updateItem(idx, "is_exempt", v)}
                  />
                </div>
                <div className="col-span-1 flex items-end justify-end">
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Notas y Adjuntos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea name="notes" placeholder="Notas opcionales para la factura..." rows={4} />

              {/* File attachments */}
              <div className="space-y-2">
                <Label>Adjuntar Documentos</Label>
                <div className="rounded-xl border-2 border-dashed border-border/50 p-5 text-center hover:border-primary/30 transition-colors">
                  <input
                    type="file"
                    id="invoice-files"
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                  <label htmlFor="invoice-files" className="cursor-pointer">
                    <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">Seleccionar archivos</span> o arrastre aquí
                    </p>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</span>
                        <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-red-600">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA 12% (incluido)</span>
                <span>{formatCurrency(totalIva)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" /> Guardar Borrador</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
