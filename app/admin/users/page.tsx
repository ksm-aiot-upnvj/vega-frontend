"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { formatDateShort, getInitials, cn } from "@/lib/utils";
import { Search, Shield, Edit, Trash2 } from "lucide-react";
import type { User, UserRole } from "@/types/user";
import { getAllUsers, updateUser, deleteUser } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "MEMBER", interest: "", password: "" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      toast("error", "Error", "Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, interest: user.interest || "", password: "" });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      // Only send password if it's filled
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete (updateData as any).password;
      }
      
      await updateUser(editingUser.id, updateData);
      toast("success", "Berhasil", "User berhasil diupdate");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast("error", "Error", "Gagal mengupdate user");
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      toast("success", "Berhasil", "User berhasil dihapus");
      fetchUsers();
    } catch (err) {
      toast("error", "Error", "Gagal menghapus user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nim && user.nim.includes(searchQuery));
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
          {user.nim || "-"}
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
        <span className="text-sm text-text-muted">{user.interest || "-"}</span>
      ),
    },
    {
      key: "joined",
      header: "Bergabung",
      render: (user: User) => (
        <span className="text-xs text-text-muted">
          {user.created_at ? formatDateShort(user.created_at) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (user: User) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEditClick(user)} className="p-1.5 rounded-lg text-text-muted hover:text-accent-400 hover:bg-accent-500/10 transition-colors cursor-pointer">
            <Edit size={14} />
          </button>
          <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg text-text-muted hover:text-error-400 hover:bg-error-500/10 transition-colors cursor-pointer">
            <Trash2 size={14} />
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

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(u) => u.id}
            emptyMessage="User tidak ditemukan"
          />
        )}

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Interest</label>
              <select
                className="w-full bg-primary-800 border border-border-secondary rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
                value={editForm.interest}
                onChange={(e) => setEditForm({ ...editForm, interest: e.target.value })}
              >
                <option value="">Tidak ada</option>
                <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                <option value="Artificial Intelligence / Machine Learning">Artificial Intelligence / Machine Learning</option>
                <option value="Web & Cloud Systems">Web & Cloud Systems</option>
              </select>
            </div>
            <Input
              label="Password Baru (Opsional)"
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Role</label>
              <select
                className="w-full bg-primary-800 border border-border-secondary rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="MEMBER">Member</option>
                <option value="MENTOR">Mentor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                Simpan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
