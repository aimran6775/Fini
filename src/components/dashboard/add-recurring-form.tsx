"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus, FileText, Receipt } from "lucide-react";
import { createRecurringTransaction } from "@/app/actions/recurring";
import { formatCurrency } from "@/lib/utils";

interface AddRecurringFormProps {
  orgId: string;
  invoices: any[];
  expenses: any[];
}

const FREQUENCIES = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "SEMIANNUAL", label: "Semestral" },
  { value: "ANNUAL", label: "Anual" },
];

export function AddRecurringForm({ orgId, invoices, expenses }: AddRecurringFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sourceType, setSourceType] = useState<"INVOICE" | "EXPENSE">("INVOICE");
  const [sourceId, setSourceId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!sourceId) {
      setError("Por favor selecciona una factura o gasto");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("organization_id", orgId);
    formData.set("source_type", sourceType);
    formData.set("source_id", sourceId);
    formData.set("frequency", frequency);

    const result = await createRecurringTransaction(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setSourceType("INVOICE");
      setSourceId("");
      setFrequency("MONTHLY");
    }
    setLoading(false);
  }

  const sources = sourceType === "INVOICE" ? invoices : expenses;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Recurrente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Transacción Recurrente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Type */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={sourceType === "INVOICE" ? "default" : "outline"}
              className="w-full"
              onClick={() => { setSourceType("INVOICE"); setSourceId(""); }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Factura
            </Button>
            <Button
              type="button"
              variant={sourceType === "EXPENSE" ? "default" : "outline"}
              className="w-full"
              onClick={() => { setSourceType("EXPENSE"); setSourceId(""); }}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Gasto
            </Button>
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <Label>{sourceType === "INVOICE" ? "Factura Base" : "Gasto Base"} *</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder={`Selecciona ${sourceType === "INVOICE" ? "una factura" : "un gasto"}...`} />
              </SelectTrigger>
              <SelectContent>
                {sources.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No hay {sourceType === "INVOICE" ? "facturas" : "gastos"} disponibles
                  </div>
                ) : (
                  sources.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="truncate max-w-[180px]">
                          {sourceType === "INVOICE" ? item.client_name : item.vendor_name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.total_amount)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se creará una copia de esta {sourceType === "INVOICE" ? "factura" : "gasto"} según la frecuencia
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frecuencia *</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Date */}
          <div className="space-y-2">
            <Label htmlFor="next_date">Próxima Fecha *</Label>
            <Input 
              id="next_date" 
              name="next_date" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date">Fecha de Fin (opcional)</Label>
            <Input 
              id="end_date" 
              name="end_date" 
              type="date" 
            />
            <p className="text-xs text-muted-foreground">
              Deja vacío para que continúe indefinidamente
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !sourceId}>
              {loading ? <Spinner size="sm" /> : "Crear Recurrente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
