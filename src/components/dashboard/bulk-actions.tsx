"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, Square, MoreHorizontal, Trash2, FileCheck, 
  Download, Send, XCircle 
} from "lucide-react";

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAction: (action: string) => Promise<{ success?: boolean; error?: string }>;
  actions: {
    id: string;
    label: string;
    icon: React.ReactNode;
    variant?: "default" | "destructive";
  }[];
}

export function BulkActionsBar({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
  onAction,
  actions,
}: BulkActionsBarProps) {
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  if (selectedIds.size === 0) return null;

  async function handleAction(actionId: string) {
    setCurrentAction(actionId);
    startTransition(async () => {
      const result = await onAction(actionId);
      if (result.error) {
        alert(result.error);
      }
      setCurrentAction(null);
    });
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-primary/10 border border-primary/20 p-3 mb-4">
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={selectedIds.size === totalCount && totalCount > 0}
          onCheckedChange={() => {
            if (selectedIds.size === totalCount) {
              onClearSelection();
            } else {
              onSelectAll();
            }
          }}
        />
        <Badge variant="secondary" className="font-mono">
          {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {actions.slice(0, 2).map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant={action.variant === "destructive" ? "destructive" : "outline"}
            onClick={() => handleAction(action.id)}
            disabled={isPending}
          >
            {isPending && currentAction === action.id ? (
              <Spinner size="sm" />
            ) : (
              <>
                {action.icon}
                <span className="hidden sm:inline ml-2">{action.label}</span>
              </>
            )}
          </Button>
        ))}

        {actions.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.slice(2).map((action, i) => (
                <DropdownMenuItem 
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className={action.variant === "destructive" ? "text-red-600" : ""}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Row selection checkbox for tables
interface SelectRowProps {
  id: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function SelectRow({ id, selected, onToggle }: SelectRowProps) {
  return (
    <Checkbox 
      checked={selected}
      onCheckedChange={() => onToggle(id)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
