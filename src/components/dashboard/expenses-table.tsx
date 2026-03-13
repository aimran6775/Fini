"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseActions } from "@/components/dashboard/expense-actions";
import { BulkActionsBar, SelectRow } from "@/components/dashboard/bulk-actions";
import { ExportButton } from "@/components/dashboard/export-button";
import { bulkDeleteExpenses, bulkApproveExpenses } from "@/app/actions/expenses";
import { exportExpensesToCSV } from "@/app/actions/export";

interface Expense {
  id: string;
  expense_date: string;
  description: string;
  category: string | null;
  account: { account_code: string; account_name: string } | null;
  amount: number;
  is_deductible: boolean;
  status: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
  organizationId: string;
}

export function ExpensesTable({ expenses, organizationId }: ExpensesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map(exp => exp.id)));
    }
  };

  const handleAction = async (action: string): Promise<{ success?: boolean; error?: string }> => {
    const ids = Array.from(selectedIds);
    
    switch (action) {
      case "delete":
        const deleteResult = await bulkDeleteExpenses(ids, organizationId);
        if (deleteResult.success) {
          setSelectedIds(new Set());
        }
        return deleteResult;
      case "approve":
        const approveResult = await bulkApproveExpenses(ids, organizationId);
        if (approveResult.success) {
          setSelectedIds(new Set());
        }
        return approveResult;
      default:
        return { error: "Acción no reconocida" };
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Wallet className="mx-auto h-12 w-12 mb-3 opacity-50" />
        <p>No hay gastos que coincidan con tu búsqueda</p>
        <Link href="/dashboard/expenses/new">
          <Button variant="outline" className="mt-4">Registrar Primer Gasto</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BulkActionsBar
          selectedIds={selectedIds}
          totalCount={expenses.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          onAction={handleAction}
          actions={[
            { id: "approve", label: "Aprobar", icon: <CheckCircle className="h-4 w-4" /> },
            { id: "delete", label: "Eliminar", icon: <Trash2 className="h-4 w-4" />, variant: "destructive" },
          ]}
        />
        <ExportButton 
          onExport={() => exportExpensesToCSV(organizationId)} 
          label="Exportar CSV"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={selectedIds.size === expenses.length && expenses.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Deducible</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => (
            <TableRow key={exp.id} className={selectedIds.has(exp.id) ? "bg-muted/50" : ""}>
              <TableCell>
                <SelectRow
                  id={exp.id}
                  selected={selectedIds.has(exp.id)}
                  onToggle={toggleSelect}
                />
              </TableCell>
              <TableCell>{formatDate(exp.expense_date)}</TableCell>
              <TableCell className="font-medium">
                <Link href={`/dashboard/expenses/${exp.id}`} className="hover:text-primary hover:underline">
                  {exp.description}
                </Link>
              </TableCell>
              <TableCell>{exp.category}</TableCell>
              <TableCell className="text-xs">
                {exp.account?.account_code} {exp.account?.account_name}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(exp.amount)}
              </TableCell>
              <TableCell>
                {exp.is_deductible ? (
                  <Badge variant="success">Sí</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={exp.status === "APPROVED" ? "success" : exp.status === "REJECTED" ? "destructive" : "secondary"}>
                  {exp.status === "APPROVED" ? "Aprobado" : exp.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>
                <ExpenseActions expenseId={exp.id} status={exp.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
