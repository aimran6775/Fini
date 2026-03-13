"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw, CheckCircle2, AlertCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createReconciliation, markTransactionsReconciled } from "@/app/actions/banking";

interface ReconciliationFormProps {
  account: any;
  orgId: string;
  transactions: any[];
  previousReconciliations: any[];
}

export function ReconciliationForm({ 
  account, 
  orgId, 
  transactions, 
  previousReconciliations 
}: ReconciliationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [statementBalance, setStatementBalance] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTxns, setSelectedTxns] = useState<Set<string>>(new Set());

  // Calculate totals
  const bookBalance = account.current_balance;
  const selectedTotal = transactions
    .filter(t => selectedTxns.has(t.id))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const adjustedBookBalance = bookBalance - selectedTotal;
  const statementNum = parseFloat(statementBalance) || 0;
  const difference = Math.abs(statementNum - adjustedBookBalance);
  const isReconciled = difference < 0.01;

  function toggleTransaction(txnId: string) {
    const newSet = new Set(selectedTxns);
    if (newSet.has(txnId)) {
      newSet.delete(txnId);
    } else {
      newSet.add(txnId);
    }
    setSelectedTxns(newSet);
  }

  function selectAll() {
    if (selectedTxns.size === transactions.length) {
      setSelectedTxns(new Set());
    } else {
      setSelectedTxns(new Set(transactions.map(t => t.id)));
    }
  }

  async function handleReconcile() {
    if (!periodStart || !periodEnd || !statementBalance) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, mark selected transactions as reconciled
      if (selectedTxns.size > 0) {
        const result = await markTransactionsReconciled(Array.from(selectedTxns), orgId);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      // Create reconciliation record
      const formData = new FormData();
      formData.set("bank_account_id", account.id);
      formData.set("organization_id", orgId);
      formData.set("period_start", periodStart);
      formData.set("period_end", periodEnd);
      formData.set("statement_balance", statementBalance);
      formData.set("book_balance", String(bookBalance));

      const result = await createReconciliation(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setSelectedTxns(new Set());
      }
    } catch (err: any) {
      setError(err?.message || "Error al conciliar");
    }
    
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Reconciliation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Nueva Conciliación Bancaria
          </CardTitle>
          <CardDescription>
            Compara el saldo del estado de cuenta bancario con el saldo en libros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="period_start">Fecha Inicio *</Label>
              <Input 
                id="period_start" 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Fecha Fin *</Label>
              <Input 
                id="period_end" 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statement_balance">Saldo Estado de Cuenta *</Label>
              <Input 
                id="statement_balance" 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={statementBalance}
                onChange={(e) => setStatementBalance(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Balance comparison */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Saldo en Libros</p>
              <p className="text-xl font-bold">{formatCurrency(bookBalance)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Estado de Cuenta</p>
              <p className="text-xl font-bold text-blue-700">
                {statementBalance ? formatCurrency(statementNum) : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Partidas en Tránsito</p>
              <p className="text-xl font-bold text-orange-700">
                {formatCurrency(selectedTotal)}
              </p>
              <p className="text-xs text-orange-600">{selectedTxns.size} seleccionadas</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${isReconciled ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-sm text-muted-foreground">Diferencia</p>
              <p className={`text-xl font-bold ${isReconciled ? "text-green-700" : "text-red-700"}`}>
                {formatCurrency(difference)}
              </p>
              {isReconciled && <CheckCircle2 className="mx-auto mt-1 h-4 w-4 text-green-600" />}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Conciliación guardada exitosamente
            </div>
          )}

          <Button 
            onClick={handleReconcile} 
            disabled={loading || !statementBalance || !periodStart || !periodEnd}
            className="w-full sm:w-auto"
          >
            {loading ? <Spinner size="sm" /> : <><RefreshCw className="mr-2 h-4 w-4" /> Guardar Conciliación</>}
          </Button>
        </CardContent>
      </Card>

      {/* Unreconciled Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partidas Sin Conciliar</CardTitle>
              <CardDescription>
                Selecciona las partidas en tránsito que explican la diferencia
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedTxns.size === transactions.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12 mb-3 text-green-500" />
              <p>¡Todas las partidas están conciliadas!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn: any) => {
                  const isDebit = txn.amount < 0;
                  const isSelected = selectedTxns.has(txn.id);
                  return (
                    <TableRow 
                      key={txn.id} 
                      className={isSelected ? "bg-orange-50" : ""}
                      onClick={() => toggleTransaction(txn.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleTransaction(txn.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {isDebit ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(txn.transaction_date).toLocaleDateString("es-GT")}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {txn.description}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {txn.reference || "—"}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isDebit ? "text-red-600" : "text-green-600"}`}>
                        {isDebit ? "-" : "+"}{formatCurrency(Math.abs(txn.amount))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Previous Reconciliations */}
      {previousReconciliations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Conciliaciones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Saldo Estado Cuenta</TableHead>
                  <TableHead className="text-right">Saldo Libros</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousReconciliations.map((rec: any) => (
                  <TableRow key={rec.id}>
                    <TableCell>
                      {new Date(rec.period_start).toLocaleDateString("es-GT")} - {new Date(rec.period_end).toLocaleDateString("es-GT")}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(rec.statement_balance)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(rec.book_balance)}</TableCell>
                    <TableCell className={`text-right ${rec.difference > 0.01 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(rec.difference)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rec.status === "COMPLETED" ? "success" : "warning"}>
                        {rec.status === "COMPLETED" ? "Completada" : "En Progreso"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
