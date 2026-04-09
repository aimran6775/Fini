"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  pageSize?: number;
}

export function Pagination({ totalItems, pageSize = 25 }: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // Generate visible page numbers
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis-start");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
      <p className="text-[13px] text-muted-foreground tabular-nums">
        {from}–{to} de {totalItems.toLocaleString("es-GT")}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) =>
          typeof p === "string" ? (
            <span key={p} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground/50">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium transition-colors ${
                p === currentPage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
