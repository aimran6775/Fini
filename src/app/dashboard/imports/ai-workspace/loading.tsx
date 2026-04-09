import { Sparkles } from "lucide-react";

export default function ImportLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="page-header">
          <h1 className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Importar con IA
          </h1>
          <p>Cargando espacio de trabajo…</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-5 animate-pulse"
          >
            <div className="h-12 w-12 rounded-lg bg-muted mb-3" />
            <div className="h-4 w-24 rounded bg-muted mb-2" />
            <div className="h-3 w-40 rounded bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
