"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ToastProvider } from "./Toast";
import { mockCurrentUser } from "@/lib/mock-data";
import type { UserRole } from "@/types/user";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: UserRole;
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userRole = role || mockCurrentUser.role;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-primary">
        {/* Sidebar */}
        <Sidebar
          role={userRole}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "ml-[72px]" : "ml-[240px]"
          )}
        >
          {/* Navbar */}
          <Navbar
            user={mockCurrentUser}
            onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Page Content */}
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
