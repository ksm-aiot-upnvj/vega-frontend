"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  User,
  GraduationCap,
  Users,
  BarChart3,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/types/user";

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const memberNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Profile", href: "/profile", icon: User },
];

const mentorNav: NavItem[] = [
  { label: "Dashboard", href: "/mentor", icon: LayoutDashboard },
  { label: "My Courses", href: "/mentor/courses", icon: GraduationCap },
  { label: "Profile", href: "/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
];

const navByRole: Record<UserRole, NavItem[]> = {
  MEMBER: memberNav,
  MENTOR: mentorNav,
  ADMIN: adminNav,
};

export default function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col bg-surface-secondary border-r border-border-secondary transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border-secondary">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-600 to-accent-500 shadow-md flex-shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gradient truncate">
              VEGA
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/mentor" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-500/10 text-accent-400 border border-accent-500/20"
                  : "text-text-muted hover:text-text-primary hover:bg-primary-700",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                className={cn("flex-shrink-0", isActive && "text-accent-400")}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border-secondary">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              import("@/lib/auth").then(({ logout }) => {
                logout();
                window.location.href = "/login";
              });
            }
          }}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-error-400 hover:bg-error-500/10 transition-all duration-200",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full bg-surface-elevated border border-border-primary text-text-muted hover:text-text-primary hover:border-accent-500/30 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
