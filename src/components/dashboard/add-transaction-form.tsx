"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { createBankTransaction } from "@/app/actions/banking";

interface AddTransactionFormProps {
  accountId: string;
  orgId: string;
}

const CATEGORIES = [
  { value: "DEPOSIT", label: "Depósito", sign: "+" },
  { value: "WITHDRAWAL", label: "Retiro", sign: "-" },
  { value: "TRANSFER", label: "Transferencia", sign: "-" },
  { value: "FEE", label: "Comisión Bancaria", sign: "-" },
  { value: "INTEREST", label: "Interés", sign: "+" },
  { value: "OTHER", label: "Otro", sign: "?" },
];

export function AddTransactionForm({ accountId, orgId }: AddTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("DEPOSIT");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("bank_account_id", accountId);
    formData.set("organization_id", orgId);

    const result = await createBankTransaction(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setCategory("DEPOSIT");
    }
    setLoading(false);
  }

  const selectedCat = CATEGORIES.find(c => c.value === category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento Bancario</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Tipo de Movimiento</Label>
            <Select 
              name="category" 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className={`mr-2 ${cat.sign === "+" ? "text-green-600" : cat.sign === "-" ? "text-red-600" : ""}`}>
                      {cat.sign}
                    </span>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Fecha *</Label>
            <Input 
              id="transaction_date" 
              name="transaction_date" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="Descripción del movimiento" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto (Q) *</Label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${
                selectedCat?.sign === "+" ? "text-green-600" : 
                selectedCat?.sign === "-" ? "text-red-600" : ""
              }`}>
                {selectedCat?.sign}
              </span>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia / No. Documento</Label>
            <Input 
              id="reference" 
              name="reference" 
              placeholder="No. de cheque, transferencia, etc." 
            />
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
              {loading ? <Spinner size="sm" /> : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
