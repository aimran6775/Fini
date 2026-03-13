"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { MoreHorizontal, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import { 
  toggleRecurringActive, 
  deleteRecurringTransaction, 
  generateFromRecurring 
} from "@/app/actions/recurring";

interface RecurringActionsProps {
  recurring: any;
  orgId: string;
  showGenerate?: boolean;
}

export function RecurringActions({ recurring, orgId, showGenerate }: RecurringActionsProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setAction("toggle");
    const result = await toggleRecurringActive(recurring.id, orgId, !recurring.is_active);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
    setAction(null);
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar esta transacción recurrente?")) return;
    
    setLoading(true);
    setAction("delete");
    const result = await deleteRecurringTransaction(recurring.id, orgId);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
    setAction(null);
  }

  async function handleGenerate() {
    setLoading(true);
    setAction("generate");
    const result = await generateFromRecurring(recurring.id, orgId);
    if (result.error) {
      alert(result.error);
    } else {
      alert(recurring.source_type === "INVOICE" 
        ? "Factura generada exitosamente (como borrador)" 
        : "Gasto generado exitosamente (como borrador)");
    }
    setLoading(false);
    setAction(null);
  }

  if (showGenerate) {
    return (
      <Button 
        size="sm" 
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading && action === "generate" ? (
          <Spinner size="sm" />
        ) : (
          <>
            <RefreshCw className="mr-2 h-3 w-3" />
            Generar
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          {loading ? <Spinner size="sm" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generar Ahora
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggle}>
          {recurring.is_active ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Activar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
