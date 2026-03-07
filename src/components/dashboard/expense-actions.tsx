"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approveExpense, deleteExpense } from "@/app/actions/expenses";
import { CheckCircle, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ExpenseActionsProps {
  expenseId: string;
  status: string;
}

export function ExpenseActions({ expenseId, status }: ExpenseActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    const result = await approveExpense(expenseId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este gasto?")) return;
    setLoading("delete");
    const result = await deleteExpense(expenseId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(null);
  }

  if (status === "DRAFT") {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="default" onClick={handleApprove} disabled={!!loading} title="Aprobar">
          {loading === "approve" ? <Spinner size="sm" /> : <CheckCircle className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={!!loading} title="Eliminar">
          {loading === "delete" ? <Spinner size="sm" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
        </Button>
      </div>
    );
  }

  return null;
}
