"use client";

import { type User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User as UserIcon, Settings, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { NotificationBell } from "@/components/dashboard/notification-bell";

interface TopbarProps {
  user: User;
  profile: any;
  onMenuToggle: () => void;
}

export function Topbar({ user, profile, onMenuToggle }: TopbarProps) {
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuario";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden rounded-xl h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-sm text-muted-foreground w-72 border border-transparent hover:border-border/60 transition-colors cursor-pointer">
          <Search className="h-4 w-4" />
          <span>Buscar...</span>
          <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded bg-background px-1.5 text-[10px] font-medium text-muted-foreground border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 rounded-xl h-auto py-1.5 px-2 hover:bg-muted/50">
              <Avatar className="h-8 w-8 rounded-xl">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-[11px] text-muted-foreground leading-none mt-1">{user.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
