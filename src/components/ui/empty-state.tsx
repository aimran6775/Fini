"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
