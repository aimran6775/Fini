"use client";

import { useState, useRef, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import {
  Menu, Search, Command, Settings, LogOut, User as UserIcon, ChevronDown,
} from "lucide-react";

interface TopbarProps {
  user: User;
  profile: any;
  onMenuToggle: () => void;
}

export function Topbar({ user, profile, onMenuToggle }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const initials = getInitials(displayName);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex items-center gap-4 border-b border-border/50 bg-white/80 backdrop-blur-xl px-4 sm:px-6 h-16 flex-shrink-0">
      {/* Mobile menu */}
      <button onClick={onMenuToggle} className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all duration-200",
          searchFocused
            ? "border-primary/30 bg-white shadow-sm ring-2 ring-primary/10"
            : "border-border/50 bg-muted/30 hover:border-border"
        )}>
          <Search className="h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Buscar..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/40">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{displayName}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{user.email}</p>
            </div>
            <ChevronDown className={cn("hidden sm:block h-3.5 w-3.5 text-muted-foreground/40 transition-transform", userMenuOpen && "rotate-180")} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-xl shadow-black/5 z-50 overflow-hidden animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="p-1.5">
                <a href="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Mi Perfil
                </a>
                <a href="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Configuración
                </a>
              </div>
              <div className="p-1.5 border-t border-border/50">
                <form action={signOut}>
                  <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
