"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
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
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar
            open={true}
            onToggle={() => setMobileSidebarOpen(false)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Topbar
            user={user}
            profile={profile}
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
