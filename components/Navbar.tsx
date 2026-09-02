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
        "sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-border-primary shadow-sm",
        className
      )}
    >
      {/* Left: Menu toggle (mobile) + Search */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-primary-100 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button 
          onClick={() => toast("info", "Notifikasi", "Tidak ada notifikasi baru")}
          className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-primary-100 transition-colors cursor-pointer"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-3 border-l border-border-primary">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-text-muted">{user.role}</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-500 text-white text-sm font-semibold">
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
