"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./topbar";

interface AdminShellProps {
  userEmail: string;
  children: ReactNode;
}

export function AdminShell({ userEmail, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050514]">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AdminSidebar open={true} onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar
          userEmail={userEmail}
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
