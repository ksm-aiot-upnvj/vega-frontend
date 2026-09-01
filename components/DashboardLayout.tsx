"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ToastProvider } from "./Toast";
import type { UserRole, User } from "@/types/user";
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("vega_user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr) as User;

      // Route Guard
      if (role && user.role !== role) {
        if (user.role === "ADMIN") router.push("/admin");
        else if (user.role === "MENTOR") router.push("/mentor");
        else router.push("/dashboard");
        return; // Do not set currentUser, keep screen blank while redirecting
      }

      setCurrentUser(user);
    } catch (e) {
      router.push("/login");
    }
  }, [role, router]);

  if (!currentUser) return <div className="min-h-screen bg-surface-primary" />;

  const userRole = currentUser.role;

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
            user={currentUser}
            onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Page Content */}
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
