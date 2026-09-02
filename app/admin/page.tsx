"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getAllUsers, getCourses } from "@/lib/api";
import type { User } from "@/types/user";
import type { Course } from "@/types/course";
import { useToast } from "@/components/Toast";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getAllUsers().catch(() => []),
      getCourses().catch(() => [])
    ])
    .then(([usersData, coursesData]) => {
      setUsers(usersData);
      setCourses(coursesData);
    })
    .catch(() => {
      toast("error", "Error", "Gagal memuat data dashboard");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [toast]);

  const totalUsers = users.length;
  const totalCourses = courses.length;
  const totalMentors = users.filter((u) => u.role === "MENTOR").length;
  const totalMembers = users.filter((u) => u.role === "MEMBER").length;
  const totalEnrolled = courses.reduce((s, c) => s + (c.enrolled_count || 0), 0);

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="text-text-muted">Loading data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-text-muted mt-1">
            Statistik dan overview sistem VEGA LMS
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger">
          {[
            { label: "Total User", value: totalUsers, icon: Users, color: "text-accent-400", bg: "bg-accent-500/10" },
            { label: "Member", value: totalMembers, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Mentor", value: totalMentors, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Course", value: totalCourses, icon: BookOpen, color: "text-rose-400", bg: "bg-rose-500/10" },
            { label: "Enrollment", value: totalEnrolled, icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Top Courses
            </h2>
            <div className="space-y-3">
              {courses
                .sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0))
                .slice(0, 5)
                .map((course, i) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border-primary shadow-sm"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 text-xs font-bold text-text-muted">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {course.category?.name || "-"}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {course.enrolled_count || 0} siswa
                    </span>
                  </div>
                ))}
              {courses.length === 0 && (
                <p className="text-sm text-text-muted">Belum ada course</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              User Terbaru
            </h2>
            <div className="space-y-3">
              {users
                .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
                .slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border-primary shadow-sm"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-accent-600 text-xs font-semibold flex-shrink-0">
                    {user.name
                      ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
                      : "-"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      user.role === "ADMIN"
                        ? "bg-rose-500/10 text-rose-400"
                        : user.role === "MENTOR"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-accent-500/10 text-accent-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-text-muted">Belum ada user</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
