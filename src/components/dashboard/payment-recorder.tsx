"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, Plus } from "lucide-react";
import { recordPayment } from "@/app/actions/invoices";
import { PAYMENT_METHOD_LABELS } from "@/lib/tax-utils";
import type { PaymentMethod } from "@/lib/types/database";

interface PaymentRecorderProps {
  invoiceId: string;
  organizationId: string;
  maxAmount: number;
  bankAccounts: Array<{ id: string; account_name: string; bank_name: string }>;
}

export function PaymentRecorder({ invoiceId, organizationId, maxAmount, bankAccounts }: PaymentRecorderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState(maxAmount.toFixed(2));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("invoice_id", invoiceId);
    formData.set("organization_id", organizationId);
    formData.set("amount", amount);
    formData.set("payment_date", paymentDate);
    formData.set("payment_method", paymentMethod);
    formData.set("reference_number", referenceNumber);
    formData.set("bank_account_id", bankAccountId);
    formData.set("notes", notes);

    const result = await recordPayment(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      router.refresh();
      // Reset form
      setAmount(maxAmount.toFixed(2));
      setPaymentMethod("EFECTIVO");
      setReferenceNumber("");
      setBankAccountId("");
      setNotes("");
      setLoading(false);
    }
  }

  const showBankFields = ["TRANSFERENCIA", "CHEQUE", "DEPOSITO"].includes(paymentMethod);
  const showCardFields = ["TARJETA_CREDITO", "TARJETA_DEBITO"].includes(paymentMethod);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Registrar Pago
            </DialogTitle>
            <DialogDescription>
              Saldo pendiente: <span className="font-semibold text-foreground">Q{maxAmount.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount & Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto (Q)*</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Fecha*</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago*</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account (for transfers, checks, deposits) */}
            {showBankFields && bankAccounts.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="bank_account">Cuenta Bancaria</Label>
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin especificar</SelectItem>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.bank_name} - {acc.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reference Number */}
            {(showBankFields || showCardFields) && (
              <div className="space-y-2">
                <Label htmlFor="reference">
                  {paymentMethod === "CHEQUE" ? "Número de Cheque" : 
                   paymentMethod === "TRANSFERENCIA" ? "Número de Transferencia" :
                   paymentMethod === "DEPOSITO" ? "Número de Boleta" :
                   "Número de Autorización"}
                </Label>
                <Input
                  id="reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)"
                rows={2}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {loading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
