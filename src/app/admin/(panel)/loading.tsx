import { Shield } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Shield className="h-6 w-6 text-red-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0ms]" />
          <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-xs text-white/30">Cargando panel de administración...</p>
      </div>
    </div>
  );
}
