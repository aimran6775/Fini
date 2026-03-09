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
        userRole: currentOrg?.role ?? "employee",
      }}
    >
      <div className="flex h-screen overflow-hidden bg-muted/30">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Sidebar — mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            open={true}
            onToggle={() => setMobileSidebarOpen(false)}
            currentOrg={currentOrg}
            organizations={organizations}
            onOrgChange={setCurrentOrg}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            user={user}
            profile={profile}
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
