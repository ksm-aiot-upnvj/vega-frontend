"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { mockCourses, mockAllUsers } from "@/lib/mock-data";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const totalUsers = mockAllUsers.length;
  const totalCourses = mockCourses.length;
  const totalMentors = mockAllUsers.filter((u) => u.role === "MENTOR").length;
  const totalMembers = mockAllUsers.filter((u) => u.role === "MEMBER").length;
  const totalEnrolled = mockCourses.reduce((s, c) => s + c.enrolled_count, 0);

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
              {mockCourses
                .sort((a, b) => b.enrolled_count - a.enrolled_count)
                .slice(0, 5)
                .map((course, i) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary-800/50"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-700 text-xs font-bold text-text-muted">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {course.mentor_name}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {course.enrolled_count} siswa
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              User Terbaru
            </h2>
            <div className="space-y-3">
              {mockAllUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary-800/50"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-accent-600 to-secondary-500 text-white text-xs font-semibold flex-shrink-0">
                    {user.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
