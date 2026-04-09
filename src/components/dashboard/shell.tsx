"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { type User } from "@supabase/supabase-js";

interface OrgContextType {
  currentOrg: any;
  setCurrentOrg: (org: any) => void;
  organizations: any[];
  userRole: string;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within DashboardShell");
  return ctx;
}

interface DashboardShellProps {
  user: User;
  profile: any;
  organizations: any[];
  children: ReactNode;
}

export function DashboardShell({ user, profile, organizations, children }: DashboardShellProps) {
  const [currentOrg, setCurrentOrg] = useState(organizations[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        setCurrentOrg,
        organizations,
        userRole: currentOrg?.role ?? "EMPLOYEE",
      }}
    >
      <CommandPalette />
      <div className="relative flex h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-15%] top-[-20%] h-[55vh] w-[55vh] rounded-full bg-blue-500/[0.04] blur-[100px]" />
          <div className="absolute bottom-[-25%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-cyan-400/[0.03] blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.02),transparent_50%)]" />
        </div>

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0 p-3 pr-0">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 p-3 pr-0 lg:hidden transition-transform duration-200 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar
            open={true}
            onToggle={() => setMobileSidebarOpen(false)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            user={user}
            profile={profile}
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
