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
import { createIsrRetencion } from "@/app/actions/personal-tax";
import { RETENTION_TYPE_LABELS, TAX_RATES } from "@/lib/tax-utils";

interface AddRetencionFormProps {
  orgId: string;
}

const RETENTION_RATES: Record<string, number> = {
  TRABAJO: 0.05,
  SERVICIOS: 0.05,
  ARRENDAMIENTO: 0.05,
  DIVIDENDOS: 0.05,
  INTERESES: 0.10,
  OTROS: 0.05,
};

export function AddRetencionForm({ orgId }: AddRetencionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [direction, setDirection] = useState<"RECEIVED" | "MADE">("RECEIVED");
  const [retentionType, setRetentionType] = useState("SERVICIOS");
  const [grossAmount, setGrossAmount] = useState("");
  const [retentionRate, setRetentionRate] = useState(RETENTION_RATES.SERVICIOS.toString());

  // Calculate retention amount
  const gross = parseFloat(grossAmount) || 0;
  const rate = parseFloat(retentionRate) || 0;
  const retentionAmount = gross * rate;

  function handleTypeChange(type: string) {
    setRetentionType(type);
    setRetentionRate(RETENTION_RATES[type]?.toString() || "0.05");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("organization_id", orgId);
    formData.set("direction", direction);
    formData.set("retention_rate", retentionRate);

    const result = await createIsrRetencion(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      // Reset
      setDirection("RECEIVED");
      setRetentionType("SERVICIOS");
      setGrossAmount("");
      setRetentionRate(RETENTION_RATES.SERVICIOS.toString());
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Retención
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Retención ISR</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction selector */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={direction === "RECEIVED" ? "default" : "outline"}
              className="w-full"
              onClick={() => setDirection("RECEIVED")}
            >
              Me Retuvieron
            </Button>
            <Button
              type="button"
              variant={direction === "MADE" ? "default" : "outline"}
              className="w-full"
              onClick={() => setDirection("MADE")}
            >
              Yo Retuve
            </Button>
          </div>

          <div className={`rounded-lg p-3 text-sm ${
            direction === "RECEIVED" 
              ? "bg-green-50 text-green-700" 
              : "bg-orange-50 text-orange-700"
          }`}>
            {direction === "RECEIVED" 
              ? "Registra las retenciones que te aplicaron terceros. Este monto es acreditable contra tu ISR."
              : "Registra las retenciones que aplicaste a terceros. Debes enterarlas a la SAT."}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="retention_type">Tipo de Retención</Label>
              <Select 
                name="retention_type" 
                value={retentionType} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RETENTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Retenedor fields (who withheld) */}
            <div className="space-y-2">
              <Label htmlFor="retenedor_name">
                {direction === "RECEIVED" ? "Nombre del Retenedor *" : "Tu Nombre/Empresa *"}
              </Label>
              <Input 
                id="retenedor_name" 
                name="retenedor_name" 
                placeholder="Nombre" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retenedor_nit">
                {direction === "RECEIVED" ? "NIT del Retenedor *" : "Tu NIT *"}
              </Label>
              <Input 
                id="retenedor_nit" 
                name="retenedor_nit" 
                placeholder="12345678-9" 
                required 
              />
            </div>

            {/* Beneficiario fields (only for MADE) */}
            {direction === "MADE" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="beneficiario_name">Beneficiario (a quien retuviste) *</Label>
                  <Input 
                    id="beneficiario_name" 
                    name="beneficiario_name" 
                    placeholder="Nombre del beneficiario" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiario_nit">NIT del Beneficiario *</Label>
                  <Input 
                    id="beneficiario_nit" 
                    name="beneficiario_nit" 
                    placeholder="12345678-9" 
                    required 
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="constancia_date">Fecha de Constancia *</Label>
              <Input 
                id="constancia_date" 
                name="constancia_date" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constancia_numero">No. de Constancia</Label>
              <Input 
                id="constancia_numero" 
                name="constancia_numero" 
                placeholder="Número de constancia" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross_amount">Monto Bruto del Servicio (Q) *</Label>
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
              <Label htmlFor="retention_rate_display">Tasa de Retención</Label>
              <Select 
                value={retentionRate}
                onValueChange={setRetentionRate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.05">5% (Servicios)</SelectItem>
                  <SelectItem value="0.065">6.5% (Bienes)</SelectItem>
                  <SelectItem value="0.10">10% (Intereses)</SelectItem>
                  <SelectItem value="0.15">15% (No domiciliados)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Calculated retention amount */}
            <div className={`col-span-2 rounded-lg p-3 ${
              direction === "RECEIVED" ? "bg-green-50" : "bg-orange-50"
            }`}>
              <div className="flex justify-between">
                <span className={`text-sm ${direction === "RECEIVED" ? "text-green-700" : "text-orange-700"}`}>
                  Monto Retención ({(parseFloat(retentionRate) * 100).toFixed(1)}%)
                </span>
                <span className={`font-bold ${direction === "RECEIVED" ? "text-green-700" : "text-orange-700"}`}>
                  Q {retentionAmount.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                </span>
              </div>
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
              {loading ? <Spinner size="sm" /> : "Guardar Retención"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
