"use client";

import { cn, getInitials } from "@/lib/utils";
import { Search, Bell, Menu } from "lucide-react";
import type { User } from "@/types/user";

import { useToast } from "@/components/Toast";

interface NavbarProps {
  user: User;
  onMenuToggle?: () => void;
  className?: string;
}

export default function Navbar({ user, onMenuToggle, className }: NavbarProps) {
  const { toast } = useToast();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-surface-secondary/80 backdrop-blur-md border-b border-border-secondary",
        className
      )}
    >
      {/* Left: Menu toggle (mobile) + Search */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-primary-800 border border-border-secondary rounded-xl px-3 py-2 min-w-[240px]">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari course, materi..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button 
          onClick={() => toast("info", "Notifikasi", "Tidak ada notifikasi baru")}
          className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-primary-700 transition-colors cursor-pointer"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-3 border-l border-border-secondary">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-text-muted">{user.role}</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-accent-600 to-secondary-500 text-white text-sm font-semibold">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
