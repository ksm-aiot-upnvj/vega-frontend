"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ProgressBar from "@/components/ProgressBar";
import { mockCurrentUser, mockEnrollments } from "@/lib/mock-data";
import { getInitials, formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Hash,
  Sparkles,
  BookOpen,
  CheckCircle,
  BarChart3,
  Calendar,
  Edit3,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const user = mockCurrentUser;
  const enrollments = mockEnrollments;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    interest: user.interest,
  });

  return (
    <DashboardLayout role="MENTOR">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="glass-card p-0 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-purple relative">
            <div className="absolute inset-0 dot-pattern opacity-20" />
          </div>

          {/* Avatar & Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-10 relative z-10">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-600 to-secondary-500 text-white text-2xl font-bold border-4 border-surface-primary shadow-lg flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-text-primary">
                  {user.name}
                </h1>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
              <div className="pb-1">
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  size="sm"
                  icon={isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Simpan" : "Edit Profil"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Course", value: user.enrolled_courses_count, icon: BookOpen, color: "text-accent-400" },
            { label: "Selesai", value: user.completed_courses_count, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Lesson", value: user.total_lessons_completed, icon: BarChart3, color: "text-amber-400" },
            { label: "Quiz Avg", value: `${user.average_quiz_score}%`, icon: BarChart3, color: "text-rose-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Details */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-primary">
            Informasi Profil
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Nama Lengkap"
                icon={<User size={16} />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Interest / Minat"
                icon={<Sparkles size={16} />}
                value={form.interest}
                onChange={(e) =>
                  setForm({ ...form, interest: e.target.value })
                }
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {[
                { icon: Hash, label: "NIM", value: user.nim },
                { icon: User, label: "Nama", value: user.name },
                { icon: Mail, label: "Email", value: user.email },
                { icon: Sparkles, label: "Interest", value: user.interest },
                { icon: Calendar, label: "Bergabung", value: formatDate(user.created_at) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary-800/50"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-700">
                    <item.icon size={16} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-sm text-text-primary font-medium">
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
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-primary-800/50"
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
        </div>
      </div>
    </DashboardLayout>
  );
}
