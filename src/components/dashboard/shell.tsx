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

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        setCurrentOrg,
        organizations,
        userRole: currentOrg?.role ?? "employee",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentOrg={currentOrg}
          organizations={organizations}
          onOrgChange={setCurrentOrg}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            user={user}
            profile={profile}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
