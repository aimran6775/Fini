"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Menu, LogOut, ExternalLink } from "lucide-react";

interface AdminTopbarProps {
  userEmail: string;
  onMobileMenuToggle: () => void;
}

export function AdminTopbar({ userEmail, onMobileMenuToggle }: AdminTopbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-400" />
          <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
            Super Admin
          </span>
          <span className="hidden sm:inline text-xs text-white/20">—</span>
          <span className="hidden sm:inline text-xs text-white/30">
            Base de datos en vivo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Link to main site */}
        <a
          href="/dashboard"
          target="_blank"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ver sitio</span>
        </a>

        <div className="h-4 w-px bg-white/10" />

        <span className="text-xs text-white/40">{userEmail}</span>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
