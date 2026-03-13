"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Banknote, CreditCard, Building2, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deletePayment } from "@/app/actions/invoices";
import { PAYMENT_METHOD_LABELS } from "@/lib/tax-utils";
import type { InvoicePayment, PaymentMethod } from "@/lib/types/database";

interface PaymentListProps {
  payments: InvoicePayment[];
  organizationId: string;
}

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  EFECTIVO: <Banknote className="h-4 w-4" />,
  TRANSFERENCIA: <Building2 className="h-4 w-4" />,
  CHEQUE: <Wallet className="h-4 w-4" />,
  TARJETA_CREDITO: <CreditCard className="h-4 w-4" />,
  TARJETA_DEBITO: <CreditCard className="h-4 w-4" />,
  DEPOSITO: <Building2 className="h-4 w-4" />,
  OTRO: <Wallet className="h-4 w-4" />,
};

export function PaymentList({ payments, organizationId }: PaymentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(paymentId: string) {
    if (!confirm("¿Está seguro de eliminar este pago? Esta acción no se puede deshacer.")) {
      return;
    }
    
    setDeletingId(paymentId);
    const result = await deletePayment(paymentId, organizationId);
    
    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
              {methodIcons[payment.payment_method]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">
                  +{formatCurrency(payment.amount)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {PAYMENT_METHOD_LABELS[payment.payment_method]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(payment.payment_date)}
              </p>
              {payment.reference_number && (
                <p className="text-xs text-muted-foreground">
                  Ref: {payment.reference_number}
                </p>
              )}
              {payment.notes && (
                <p className="text-xs text-muted-foreground italic">
                  {payment.notes}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(payment.id)}
            disabled={deletingId === payment.id}
            title="Eliminar pago"
          >
            {deletingId === payment.id ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
