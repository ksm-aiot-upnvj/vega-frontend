"use client";

import { PageLoader } from "@/components/LoadingState";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ProgressBar from "@/components/ProgressBar";
import { getInitials, formatDate } from "@/lib/utils";
import {
  User as UserIcon,
  Mail,
  Hash,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  Key
} from "lucide-react";
import { getCurrentUser, updatePassword, getMyEnrollments } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { User } from "@/types/user";
import type { Enrollment } from "@/types/course";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getMyEnrollments().catch(() => [])
    ])
    .then(([userData, enrollmentData]) => {
      setUser(userData);
      setEnrollments(enrollmentData);
    })
    .catch(() => {
      toast("error", "Error", "Gagal memuat profil");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [toast]);

  const handleUpdatePassword = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast("error", "Error", "Semua field password wajib diisi");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast("error", "Error", "Konfirmasi password tidak cocok");
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword({ 
        old_password: form.oldPassword, 
        new_password: form.newPassword 
      });
      
      toast("success", "Berhasil", "Password berhasil diperbarui!");
      setIsEditingPassword(false);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast("error", "Error", err.message || "Gagal memperbarui password");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;
  if (!user) return <DashboardLayout><div className="text-text-muted">Gagal memuat pengguna</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="glass-card p-0 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-accent-500 relative">
            <div className="absolute inset-0 dot-pattern opacity-20" />
          </div>

          {/* Avatar & Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end relative z-10">
              <div className="-mt-12 flex items-center justify-center w-24 h-24 rounded-2xl bg-white text-accent-500 text-3xl font-bold border-4 border-surface-primary shadow-lg flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  {user.name}
                </h1>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              Informasi Profil
            </h2>
            {!isEditingPassword && (
              <Button variant="outline" size="sm" icon={<Key size={14} />} onClick={() => setIsEditingPassword(true)}>
                Ganti Password
              </Button>
            )}
          </div>

          {isEditingPassword ? (
            <div className="space-y-4 p-4 rounded-xl bg-surface-primary border border-border-primary">
              <h3 className="text-sm font-medium text-text-primary mb-2">Ubah Password</h3>
              <Input
                label="Password Lama"
                type="password"
                placeholder="Masukkan password saat ini"
                icon={<Lock size={16} />}
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              />
              <Input
                label="Password Baru"
                type="password"
                placeholder="Masukkan password baru"
                icon={<Key size={16} />}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              <Input
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Ulangi password baru"
                icon={<Key size={16} />}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => {
                  setIsEditingPassword(false);
                  setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }}>
                  Batal
                </Button>
                <Button onClick={handleUpdatePassword} loading={isSaving}>
                  Simpan Password
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {[
                { icon: Hash, label: "NIM", value: user.nim || "-" },
                { icon: UserIcon, label: "Nama", value: user.name },
                { icon: Mail, label: "Email", value: user.email },
                { icon: Sparkles, label: "Keahlian / Fokus", value: user.interest || "-" },
                { icon: Calendar, label: "Bergabung", value: user.created_at ? formatDate(user.created_at) : "-" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-border-secondary"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-primary">
                    <item.icon size={16} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-sm text-text-secondary font-medium">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Courses */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Course Terdaftar
          </h2>
          {enrollments.length === 0 ? (
            <p className="text-sm text-text-muted">Belum ada course yang diikuti.</p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white border border-border-primary shadow-sm"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex-shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {enrollment.course?.title || "Course"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {enrollment.completed_lessons}/{enrollment.total_lessons}{" "}
                      lesson
                    </p>
                  </div>
                  <div className="w-24">
                    <ProgressBar
                      value={enrollment.progress_percentage}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
