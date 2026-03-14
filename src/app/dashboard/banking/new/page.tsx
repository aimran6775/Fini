"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { createBankAccount } from "@/app/actions/banking";
import { useOrg } from "@/components/dashboard/shell";

export default function NewBankAccountPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    formData.set("organization_id", currentOrg.id);
    const result = await createBankAccount(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/banking");
  }

  const banks = [
    "Banco Industrial", "Banrural", "G&T Continental", "BAM",
    "Banco de los Trabajadores", "Banco Promerica", "Banco Agromercantil",
    "Banco Inmobiliario", "BAC Credomatic", "Banco Internacional",
    "Ficohsa Guatemala", "Banco Azteca", "Vivibanco", "Otro",
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Cuenta Bancaria</h1>
        <p className="text-muted-foreground">Agregar cuenta de banco para conciliación</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco *</Label>
                <Select name="bank_name">
                  <SelectTrigger><SelectValue placeholder="Seleccionar banco" /></SelectTrigger>
                  <SelectContent>
                    {banks.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Tipo de Cuenta *</Label>
                <Select name="account_type" defaultValue="CHECKING">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Monetaria</SelectItem>
                    <SelectItem value="SAVINGS">Ahorro</SelectItem>
                    <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account_number">Número de Cuenta *</Label>
                <Input id="account_number" name="account_number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_name">Nombre / Alias</Label>
                <Input id="account_name" name="account_name" placeholder="Ej: Cuenta principal BI" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select name="currency" defaultValue="GTQ">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTQ">GTQ — Quetzal</SelectItem>
                    <SelectItem value="USD">USD — Dólar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_balance">Saldo Inicial (GTQ)</Label>
                <Input id="current_balance" name="current_balance" type="number" step="0.01" defaultValue="0" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton>Guardar Cuenta Bancaria</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
