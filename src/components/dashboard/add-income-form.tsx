"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { createPersonalIncome } from "@/app/actions/personal-tax";
import { INCOME_TYPE_LABELS } from "@/lib/tax-utils";

interface AddIncomeFormProps {
  orgId: string;
}

export function AddIncomeForm({ orgId }: AddIncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [incomeType, setIncomeType] = useState("TRABAJO_DEPENDIENTE");
  const [grossAmount, setGrossAmount] = useState("");
  const [isrWithheld, setIsrWithheld] = useState("");
  const [igssWithheld, setIgssWithheld] = useState("");
  const [hasConstancia, setHasConstancia] = useState(false);

  // Calculate net amount
  const gross = parseFloat(grossAmount) || 0;
  const isr = parseFloat(isrWithheld) || 0;
  const igss = parseFloat(igssWithheld) || 0;
  const netAmount = gross - isr - igss;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("organization_id", orgId);
    formData.set("net_amount", String(netAmount));
    formData.set("has_constancia", String(hasConstancia));

    const result = await createPersonalIncome(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      // Reset form
      setIncomeType("TRABAJO_DEPENDIENTE");
      setGrossAmount("");
      setIsrWithheld("");
      setIgssWithheld("");
      setHasConstancia(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ingreso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Ingreso Personal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="income_type">Tipo de Ingreso</Label>
              <Select 
                name="income_type" 
                value={incomeType} 
                onValueChange={setIncomeType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Ej: Salario mensual enero" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_name">Fuente / Empleador</Label>
              <Input 
                id="source_name" 
                name="source_name" 
                placeholder="Nombre de la empresa" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_nit">NIT Empleador</Label>
              <Input 
                id="source_nit" 
                name="source_nit" 
                placeholder="12345678-9" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income_date">Fecha *</Label>
              <Input 
                id="income_date" 
                name="income_date" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross_amount">Monto Bruto (Q) *</Label>
              <Input 
                id="gross_amount" 
                name="gross_amount" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                required
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isr_withheld">ISR Retenido (Q)</Label>
              <Input 
                id="isr_withheld" 
                name="isr_withheld" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                value={isrWithheld}
                onChange={(e) => setIsrWithheld(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igss_withheld">IGSS Retenido (Q)</Label>
              <Input 
                id="igss_withheld" 
                name="igss_withheld" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                value={igssWithheld}
                onChange={(e) => setIgssWithheld(e.target.value)}
              />
            </div>

            {/* Net amount display */}
            <div className="col-span-2 rounded-lg bg-green-50 p-3">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Monto Neto</span>
                <span className="font-bold text-green-700">
                  Q {netAmount.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="has_constancia" className="cursor-pointer">
                  ¿Tiene constancia de retención?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Documento que acredita el ISR retenido
                </p>
              </div>
              <Switch 
                id="has_constancia" 
                checked={hasConstancia}
                onCheckedChange={setHasConstancia}
              />
            </div>

            {hasConstancia && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="constancia_numero">Número de Constancia</Label>
                <Input 
                  id="constancia_numero" 
                  name="constancia_numero" 
                  placeholder="Número de documento" 
                />
              </div>
            )}

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
              {loading ? <Spinner size="sm" /> : "Guardar Ingreso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
