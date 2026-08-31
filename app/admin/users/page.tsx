"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { mockAllUsers } from "@/lib/mock-data";
import { formatDateShort, getInitials, cn } from "@/lib/utils";
import { Search, Shield, Edit } from "lucide-react";
import type { User } from "@/types/user";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = mockAllUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nim.includes(searchQuery);
    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent-600 to-secondary-500 text-white text-xs font-semibold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {user.name}
            </p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "nim",
      header: "NIM",
      render: (user: User) => (
        <span className="text-sm text-text-secondary font-mono">
          {user.nim}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium",
            user.role === "ADMIN"
              ? "bg-rose-500/10 text-rose-400"
              : user.role === "MENTOR"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-accent-500/10 text-accent-400"
          )}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: "interest",
      header: "Interest",
      render: (user: User) => (
        <span className="text-sm text-text-muted">{user.interest}</span>
      ),
    },
    {
      key: "joined",
      header: "Bergabung",
      render: (user: User) => (
        <span className="text-xs text-text-muted">
          {formatDateShort(user.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-text-muted hover:text-accent-400 hover:bg-accent-500/10 transition-colors cursor-pointer">
            <Edit size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer">
            <Shield size={14} />
          </button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Kelola <span className="text-gradient">User</span>
          </h1>
          <p className="text-text-muted mt-1">
            Manajemen user dan role VEGA LMS
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 bg-primary-800 border border-border-secondary rounded-xl px-4 py-2.5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari nama, email, atau NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
            />
          </div>
          <div className="flex gap-2">
            {["all", "MEMBER", "MENTOR", "ADMIN"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  roleFilter === role
                    ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                    : "bg-primary-800 text-text-muted border border-border-secondary hover:text-text-primary"
                )}
              >
                {role === "all" ? "Semua" : role}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-text-muted">
          {filteredUsers.length} user ditemukan
        </p>

        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(u) => u.id}
          emptyMessage="User tidak ditemukan"
        />
      </div>
    </DashboardLayout>
  );
}
