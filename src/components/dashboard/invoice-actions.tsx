"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { certifyInvoice, voidInvoice, deleteInvoice } from "@/app/actions/invoices";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCertify() {
    if (!confirm("¿Certificar esta factura? Esta acción la enviará al SAT.")) return;
    setLoading("certify");
    const result = await certifyInvoice(invoiceId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(null);
  }

  async function handleVoid() {
    const reason = prompt("Motivo de anulación:");
    if (!reason) return;
    setLoading("void");
    const result = await voidInvoice(invoiceId, reason);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este borrador?")) return;
    setLoading("delete");
    const result = await deleteInvoice(invoiceId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(null);
  }

  if (status === "DRAFT") {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="default" onClick={handleCertify} disabled={!!loading} title="Certificar">
          {loading === "certify" ? <Spinner size="sm" /> : <CheckCircle className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={!!loading} title="Eliminar">
          {loading === "delete" ? <Spinner size="sm" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
        </Button>
      </div>
    );
  }

  if (status === "CERTIFIED") {
    return (
      <Button size="sm" variant="outline" onClick={handleVoid} disabled={!!loading} title="Anular">
        {loading === "void" ? <Spinner size="sm" /> : <><XCircle className="mr-1 h-3.5 w-3.5" /> Anular</>}
      </Button>
    );
  }

  return null;
}
