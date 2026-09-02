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
  Megaphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
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
  { label: "Group", href: "/group", icon: Users },
  { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { label: "Profile", href: "/profile", icon: User },
];

const mentorNav: NavItem[] = [
  { label: "Dashboard", href: "/mentor", icon: LayoutDashboard },
  { label: "My Courses", href: "/mentor/courses", icon: GraduationCap },
  { label: "Submissions", href: "/mentor/submissions", icon: ClipboardList },
  { label: "Group", href: "/mentor/group", icon: Users },
  { label: "Announcements", href: "/mentor/announcements", icon: Megaphone },
  { label: "Profile", href: "/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Group Mapping", href: "/admin/groups", icon: Users },
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
        "fixed left-0 top-0 z-40 h-screen flex flex-col bg-accent-500 transition-all duration-300 shadow-lg",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/20">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="Vega Logo" className="w-9 h-9 object-contain flex-shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-white truncate">
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
                  ? "bg-white/20 text-white font-semibold shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                className={cn("flex-shrink-0", isActive ? "text-white" : "text-white/80")}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/20">
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
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200",
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
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-border-primary text-text-muted hover:text-accent-600 hover:border-accent-400 transition-all cursor-pointer shadow-sm"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
