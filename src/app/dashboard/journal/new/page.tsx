"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createJournalEntry } from "@/app/actions/accounting";
import { useOrg } from "@/components/dashboard/shell";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  account_code: string;
  account_name: string;
}

interface JournalLine {
  account_id: string;
  description: string;
  debit: string;
  credit: string;
}

export default function NewJournalEntryPage() {
  const { currentOrg } = useOrg();
  const router = useRouter();
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: "", description: "", debit: "", credit: "" },
    { account_id: "", description: "", debit: "", credit: "" },
  ]);

  useEffect(() => {
    async function loadAccounts() {
      const supabase = createClient();
      const { data } = await supabase
        .from("chart_of_accounts")
        .select("id, account_code, account_name")
        .eq("organization_id", currentOrg.id)
        .eq("is_active", true)
        .order("account_code");
      setAccounts(data ?? []);
    }
    loadAccounts();
  }, [currentOrg.id]);

  const addLine = () => setLines([...lines, { account_id: "", description: "", debit: "", credit: "" }]);
  const removeLine = (i: number) => lines.length > 2 && setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof JournalLine, value: string) => {
    const updated = [...lines];
    updated[i] = { ...updated[i], [field]: value };
    setLines(updated);
  };

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  async function handleSubmit(formData: FormData) {
    setError("");
    if (!balanced) {
      setError("La partida debe estar cuadrada (débito = crédito)");
      return;
    }
    formData.set("organization_id", currentOrg.id);
    // Map lines with account_id (UUID) for the action
    const mappedLines = lines.map((l) => ({
      account_id: l.account_id,
      description: l.description,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
    }));
    formData.set("lines", JSON.stringify(mappedLines));
    const result = await createJournalEntry(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/journal");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Partida Contable</h1>
        <p className="text-muted-foreground">Registro de asiento en el diario general</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Fecha *</Label>
                <Input id="entry_date" name="entry_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input id="reference" name="reference" placeholder="Ej: PD-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>

            {/* Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Líneas de la Partida</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="mr-1 h-3 w-3" /> Agregar Línea
                </Button>
              </div>
              <div className="rounded-lg border divide-y">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-medium">
                  <div className="col-span-3">Cuenta Contable</div>
                  <div className="col-span-3">Descripción</div>
                  <div className="col-span-2 text-right">Debe (GTQ)</div>
                  <div className="col-span-2 text-right">Haber (GTQ)</div>
                  <div className="col-span-2" />
                </div>
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center">
                    <div className="col-span-3">
                      <Select
                        value={line.account_id}
                        onValueChange={(v) => updateLine(i, "account_id", v)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Seleccionar cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.account_code} — {acc.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(i, "description", e.target.value)}
                        placeholder="Descripción"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit}
                        onChange={(e) => updateLine(i, "debit", e.target.value)}
                        placeholder="0.00"
                        className="text-sm text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit}
                        onChange={(e) => updateLine(i, "credit", e.target.value)}
                        placeholder="0.00"
                        className="text-sm text-right"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)} disabled={lines.length <= 2}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                {/* Totals */}
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-semibold text-sm">
                  <div className="col-span-6">Totales</div>
                  <div className="col-span-2 text-right">Q{totalDebit.toFixed(2)}</div>
                  <div className="col-span-2 text-right">Q{totalCredit.toFixed(2)}</div>
                  <div className="col-span-2 text-center">
                    {balanced ? (
                      <span className="text-green-600 text-xs">✓ Cuadrada</span>
                    ) : (
                      <span className="text-red-600 text-xs">✗ Descuadrada</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <SubmitButton disabled={!balanced}>Registrar Partida</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
