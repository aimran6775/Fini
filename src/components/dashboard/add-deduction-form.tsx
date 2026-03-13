"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { createPersonalDeduction } from "@/app/actions/personal-tax";
import { DEDUCTION_TYPE_LABELS } from "@/lib/tax-utils";

interface AddDeductionFormProps {
  orgId: string;
}

export function AddDeductionForm({ orgId }: AddDeductionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deductionType, setDeductionType] = useState("IVA_PERSONAL");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("organization_id", orgId);

    const result = await createPersonalDeduction(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setDeductionType("IVA_PERSONAL");
    }
    setLoading(false);
  }

  // Filter out STANDARD since it's automatic
  const deductionOptions = Object.entries(DEDUCTION_TYPE_LABELS).filter(
    ([key]) => key !== "STANDARD"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Deducción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Deducción</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <strong>Nota:</strong> La deducción fija de Q48,000 anuales se aplica automáticamente. 
            Aquí puedes registrar deducciones adicionales como IVA en compras personales, donaciones, etc.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="deduction_type">Tipo de Deducción</Label>
              <Select 
                name="deduction_type" 
                value={deductionType} 
                onValueChange={setDeductionType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deductionOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {deductionType === "IVA_PERSONAL" && (
                <p className="text-xs text-muted-foreground">
                  Máximo deducible: 12% de tu renta bruta anual
                </p>
              )}
              {deductionType === "DONACIONES" && (
                <p className="text-xs text-muted-foreground">
                  Máximo deducible: 5% de tu renta bruta anual. Solo a entidades autorizadas.
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Ej: Facturas IVA enero-marzo" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction_date">Fecha *</Label>
              <Input 
                id="deduction_date" 
                name="deduction_date" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto (Q) *</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_ref">No. Factura / Documento</Label>
              <Input 
                id="document_ref" 
                name="document_ref" 
                placeholder="Referencia del documento" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_nit">NIT Proveedor</Label>
              <Input 
                id="vendor_nit" 
                name="vendor_nit" 
                placeholder="12345678-9" 
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Notas adicionales..." 
                rows={2}
              />
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Guardar Deducción"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
