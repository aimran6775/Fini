"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createAccount } from "@/app/actions/accounting";

interface CreateAccountDialogProps {
  orgId: string;
  accounts: Array<{ id: string; account_code: string; account_name: string }>;
}

export function CreateAccountDialog({ orgId, accounts }: CreateAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    form.set("organization_id", orgId);

    const result = await createAccount(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nueva Cuenta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Cuenta Contable</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_code">Código *</Label>
              <Input id="account_code" name="account_code" placeholder="1.1.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Nombre *</Label>
              <Input id="account_name" name="account_name" placeholder="Caja General" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Cuenta *</Label>
            <Select name="account_type" required>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ASSET">Activo</SelectItem>
                <SelectItem value="LIABILITY">Pasivo</SelectItem>
                <SelectItem value="EQUITY">Patrimonio</SelectItem>
                <SelectItem value="REVENUE">Ingreso</SelectItem>
                <SelectItem value="COST">Costo</SelectItem>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cuenta Padre (opcional)</Label>
            <Select name="parent_account_id">
              <SelectTrigger><SelectValue placeholder="Ninguna (cuenta de nivel superior)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Ninguna</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.account_code} — {acc.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Crear Cuenta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
